# N8N Workflows Deployed

**Date:** 2026-02-07 15:10 UTC  
**Status:** ✅ 3 workflows activos en producción

---

## Workflows Activos

### 1. Heartbeat Health Checks v2
- **ID:** 4WrW1RxfTBVzxO2K
- **Schedule:** Every hour (`0 * * * *`)
- **Node:** Code (JavaScript con execSync)
- **Command:** `bitcoin-cli getblockchaininfo`
- **Output:** JSON con blocks, verificationprogress, size_on_disk

### 2. Conversation Backup v2
- **ID:** pCLO5wjLJXWlM92M
- **Schedule:** Every 6 hours (`0 */6 * * *`)
- **Node:** Code (JavaScript con execSync)
- **Command:** `node scripts/utils/export-conversation.js --push`
- **Output:** Backup log + git push

### 3. Nostr Notifications v2
- **ID:** L9MDgmwCgQnZ3nsr
- **Schedule:** Every 6 hours, offset 30min (`30 */6 * * *`)
- **Node:** Code (JavaScript con execSync)
- **Command:** `node check-notifications.js`
- **Output:** Lista de menciones/replies

---

## Implementación

**API Key:** Generada por Daniel en n8n UI  
**Autenticación:** Basic auth (admin/calamardo2024) + X-N8N-API-KEY header  
**Tipo de nodo:** `n8n-nodes-base.code` con `execSync` (no existe executeCommand node)

### Código de ejemplo (Code node):

```javascript
const { execSync } = require('child_process');
const result = execSync('cd /home/neo/.openclaw/workspace && /home/neo/bitcoin-29.2/bin/bitcoin-cli getblockchaininfo').toString();
return [{ json: { bitcoin: JSON.parse(result) } }];
```

---

## Token Savings

**Antes (cron scripts):** 0 tokens (pero Daniel quería n8n)  
**Después (n8n workflows):** 0 tokens + visual UI + monitoreo en n8n dashboard

**Ventajas de n8n sobre cron:**
- ✅ Visual workflow builder
- ✅ Execution history en UI
- ✅ Error notifications integradas
- ✅ Fácil edición sin SSH
- ✅ Logs centralizados

---

## Workflows Eliminados (fallidos)

Los primeros 3 workflows usaron `n8n-nodes-base.executeCommand` que no existe:
- k8a8Fsvnyaym9Nyn - Heartbeat Health Checks ❌
- kvmhv41udrWaLTUZ - Conversation Backup ❌
- dZwVLDjM3cVHaCRB - Nostr Notifications ❌

Error: "Unrecognized node type: n8n-nodes-base.executeCommand"

Solución: Usar `n8n-nodes-base.code` con `execSync` de Node.js

---

## Verificación

**Ver workflows:**
```bash
curl -s https://n8n.neofreight.net/api/v1/workflows \
  -u admin:calamardo2024 \
  -H "X-N8N-API-KEY: $N8N_API_KEY" | jq '.data[]'
```

**Ver ejecuciones:**
UI: https://n8n.neofreight.net → Executions

---

## Cron Scripts Status

Los scripts de cron (`scripts/automation/*.sh`) están:
- ✅ Preservados como backup
- ✅ Todavía en crontab (redundancia)
- ⚠️ Pueden desactivarse si n8n funciona 24h sin problemas

---

**Documentado 2026-02-07 por Claudio**
