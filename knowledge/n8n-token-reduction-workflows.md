# N8N Workflows — Reducción de Tokens OpenClaw

**Creado:** 2026-02-07 14:16 UTC  
**Objetivo:** Automatizar checks repetitivos para reducir 80-95% de tokens en heartbeats

---

## Acceso N8N

- URL: `https://neofreight.net/n8n/`
- User: `admin`
- Password: (misma que otros servicios Caddy)

---

## Workflow 1: Heartbeat Health Checks (PRIORITARIO)

**Ahorro estimado:** 95% tokens en heartbeats normales

### Trigger
- **Node:** Schedule Trigger
- **Interval:** Every 60 minutes
- **Cron:** `0 * * * *` (cada hora en punto)

### Flow

1. **Execute Command** — Bitcoin Node Status
   ```bash
   BITCOIN_CLI="/home/neo/bitcoin-29.2/bin/bitcoin-cli"
   $BITCOIN_CLI getblockchaininfo | jq -r '.blocks, .verificationprogress, .size_on_disk'
   ```

2. **Execute Command** — LND Status
   ```bash
   /home/neo/lnd-linux-amd64-v0.20.0-beta/lncli getinfo | jq -r '.block_height, .num_peers, .num_active_channels'
   ```

3. **Execute Command** — System Resources
   ```bash
   df -h / | tail -1 | awk '{print $5}' # Disk usage %
   free -h | grep Mem | awk '{print $3"/"$2}' # RAM usage
   ```

4. **IF Node** — Check for Problems
   - Condition: Bitcoin blocks < 935000 OR LND peers < 3 OR Disk > 90%
   - **TRUE branch:** HTTP Request → OpenClaw Webhook (envía alerta)
   - **FALSE branch:** Stop (no hace nada)

### OpenClaw Webhook (para alertas)
```javascript
POST https://neofreight.net/openclaw/webhook
Headers:
  Content-Type: application/json
Body:
{
  "session": "main",
  "message": "🚨 ALERTA HEARTBEAT: {{$json.problem}}"
}
```

**Nota:** Necesitas configurar webhook en OpenClaw gateway config

---

## Workflow 2: Conversation Backup (CRÍTICO)

**Ahorro estimado:** 100% tokens (sin Claude)

### Trigger
- **Node:** Schedule Trigger
- **Interval:** Every 6 hours
- **Cron:** `0 */6 * * *` (00:00, 06:00, 12:00, 18:00 UTC)

### Flow

1. **Execute Command** — Export + Push
   ```bash
   cd /home/neo/.openclaw/workspace
   node scripts/utils/export-conversation.js --push
   ```

2. **IF Node** — Check Exit Code
   - Condition: `{{$json.code}}` !== 0
   - **TRUE:** HTTP Request → OpenClaw Webhook (alerta de fallo)

**Resultado:** Backups automáticos cada 6h sin gastar tokens

---

## Workflow 3: Nostr Notifications Check

**Ahorro estimado:** 80% tokens (solo llama Claude si hay menciones)

### Trigger
- **Node:** Schedule Trigger
- **Interval:** Every 6 hours
- **Cron:** `30 */6 * * *` (offset 30 min del backup)

### Flow

1. **Execute Command** — Check Notifications
   ```bash
   cd /home/neo/.openclaw/workspace/scripts/nostr
   node check-notifications.js --json
   ```

2. **IF Node** — Parse Result
   - Condition: `{{$json.mentions}}` > 0 OR `{{$json.replies}}` > 0
   - **TRUE:** HTTP Request → OpenClaw Webhook
     ```json
     {
       "session": "main",
       "message": "📬 Nostr: {{$json.mentions}} menciones, {{$json.replies}} replies"
     }
     ```
   - **FALSE:** Stop

**Resultado:** Solo consume tokens cuando hay interacción real

---

## Workflow 4 (FUTURO): Moltbook Feed Check

Similar a Nostr, pero usando `scripts/moltbook/check-feed.js`

---

## Implementación

### Paso 1: Crear Workflows en N8N
1. Accede `https://neofreight.net/n8n/`
2. Click "Add workflow" para cada uno
3. Arrastra nodos según diagrama arriba
4. Activa cada workflow (toggle ON)

### Paso 2: Configurar OpenClaw Webhook (NECESARIO)

Editar gateway config para aceptar webhooks:

```yaml
# En OpenClaw config
http:
  webhooks:
    enabled: true
    routes:
      - path: /webhook
        session: main
        auth: bearer
        token: "GENERATE_SECURE_TOKEN"
```

**Generar token:**
```bash
openssl rand -hex 32
```

Luego actualizar workflows n8n con token en headers:
```
Authorization: Bearer YOUR_TOKEN_HERE
```

### Paso 3: Actualizar HEARTBEAT.md

Eliminar checks que ahora hace n8n:
- ❌ Bitcoin node check
- ❌ LND status
- ❌ System resources
- ✅ Mantener: nightshift-wakeup.txt, Daniel messages, Task Queue

---

## Monitoreo

Verificar workflows están corriendo:
1. N8N Dashboard → Executions
2. Ver logs: cada ejecución muestra si tuvo éxito/fallo
3. Si fallo → revisar error en execution log

---

## Resultado Esperado

**Antes (solo Claude):**
- Heartbeat cada 60 min = ~1,500 tokens
- 24 heartbeats/día = 36,000 tokens/día

**Después (n8n + Claude solo si necesario):**
- N8N check cada 60 min = 0 tokens
- Claude solo si problema = ~150 tokens/alerta
- Si 23/24 checks OK = ~1,650 tokens/día

**Ahorro:** 95% tokens en heartbeats (~34,000 tokens/día)

---

## Notas

- Workflows corren en Docker n8n (ya instalado, corriendo)
- Todos los scripts ya existen en workspace
- Solo falta configurar triggers en n8n UI
- Webhook OpenClaw es el único componente nuevo (requiere gateway config update)

**Tiempo estimado setup:** 15-20 min

---

*Documentado 2026-02-07 por Claudio*
