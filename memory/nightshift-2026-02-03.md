# Nightshift 2026-02-03

**Session:** 02:00-03:00 UTC (martes)
**Model:** Sonnet 4.5
**Task:** Auditoría + Aprendizaje (OpenClaw architecture) + Organización

---

## Auditoría (15 min) 🔍

### Bitcoin Node (02:00 UTC, VERIFICADO)
```
Blocks: 934,786 / 934,786 (100%)
Progress: 100.00%
IBD: false (completado)
Peers: 10
Disk: 0.58 GB (pruned, target 550MB)
Version: /Satoshi:29.2.0(ClaudioNode)/
```
**Status:** ✅ Nodo 100% operacional, corriendo desde Jan 31

### Sistema
- **Disco:** 96G/464G (21%) — suficiente espacio
- **RAM:** 11Gi/15Gi usado, 4.3Gi disponible — ajustado pero estable
- **Procesos:**
  - bitcoind: PID 59267, 75% CPU (normal), 3.3GB RAM
  - openclaw-gateway: PID 3614078, corriendo desde Feb 01
  - lnd: NO corriendo (esperando go-ahead de Daniel)

### Nostr Relay (strfry)
```bash
$ curl -s http://localhost:7777 -H "Accept: application/nostr+json" | jq .
{
  "name": "Claudio's Sovereign Relay",
  "description": "Personal Nostr relay operated by Claudio 🦞 — AI Agent running OpenClaw. Sovereign communication.",
  "contact": "claudio@neofreight.net",
  "software": "git+https://github.com/hoytech/strfry.git",
  "version": "1.0.4",
  "supported_nips": [1, 2, 4, 9, 11, 22, 28, 40, 70, 77],
  "negentropy": 1
}
```
**Status:** ✅ Relay operativo desde 00:13 UTC (2h uptime)

### LN Markets Trade (02:01 UTC, VERIFICADO)
```
Trade: Long BTC $10 @ $82,842 (2x leverage)
Entry: $82,842
Current: $78,797.5 (-4.88%)
PnL: -622 sats (-10.3% on margin)
Balance: 193,937 sats
Liquidation: $55,239 (muy lejos, seguro)
SL: $74,000 | TP: $85,000
```
**Status:** Underwater pero sin riesgo. Precio cayó ~$4,000 desde entry.

### Upstream OpenClaw
**Commits nuevos (Feb 2):**
- `c6b4de520` — **FIX CRÍTICO:** Telegram "timed out" recovery
  - Problema: grammY `getUpdates` timeout de 500s no se clasificaba como recoverable
  - Error: "Request to getUpdates **timed out** after 500 seconds"
  - `RECOVERABLE_MESSAGE_SNIPPETS` solo tenía "timeout" (no "timed out")
  - Consecuencia: polling loop moría silenciosamente
  - Fix: añadir "timed out" a recoverable snippets
  - Tests: src/telegram/network-errors.test.ts
- `561a10c49` — Changelog update (merge del anterior)

**Implicación:** Este fix explica crashes/desconexiones Telegram recientes
**Acción recomendada:** Cherry-pick `c6b4de520` a `claudio/sovereign`

**Feature branch:** `upstream/feature/qmd-memory` (43 commits, no merged)
- QMD = Query Memory Documents
- Permite queries estructuradas sobre documentos de memoria
- Path checks hardened, citation clamp, throttle embeddings
- Mejorará capacidad de búsqueda y citación cuando se merge

### Cron Backup
- ✅ Conversations exportadas hasta 01:59 UTC
- Archivos: 5 conversaciones del 2-3 Feb en conversations/
- Tamaño total: 9.6MB

---

## Aprendizaje (25 min) 🏗️

**Tema del día:** OpenClaw Architecture (martes per NIGHTSHIFT_PLAN.md)

### Metodología
- Leído: src/entry.ts, gateway/*, sessions/*, memory/*, agents/*
- Documentación: docs/concepts/architecture.md, docs/concepts/memory.md, docs/cli/memory.md
- Líneas revisadas: ~800 código directo + ~2000 docs
- Output: knowledge/openclaw-architecture-deep-dive.md (11KB, ~12,000 bytes)

### Key Insights

#### 1. Gateway-Centric Architecture
- **WebSocket server** (puerto 18789) como central coordinator
- Todos los providers (Telegram/grammY, WhatsApp/Baileys, Slack, Discord, Signal, iMessage) conectan al Gateway
- Clients (macOS app, CLI, web UI) + Nodes (iOS/Android/headless) conectan vía WS
- **Invariante crítico:** Exactamente UN Gateway por host (WhatsApp/Baileys limitation)

**Wire protocol:**
```
Client                    Gateway
  |---- req:connect -------->|
  |<----- res (ok) ----------|  (payload=hello-ok)
  |<----- event:presence ----|
  |<----- event:tick --------|
  |------ req:agent -------->|
  |<----- res:agent ---------|  (ack: runId, accepted)
  |<----- event:agent -------|  (streaming)
  |<----- res:agent ---------|  (final)
```

#### 2. Memory System — Two Layers + Pre-Compaction Flush
**Files:**
- `memory/YYYY-MM-DD.md` — daily log (today + yesterday auto-loaded)
- `MEMORY.md` — curated long-term (SOLO en sesión main/private)

**Pre-compaction flush** = sistema que me salva de amnesia:
- Trigger: cuando sesión se acerca a límite de contexto
- Cálculo: `contextWindow - reserveTokensFloor - softThresholdTokens`
- Ejecuta: turno agéntico silencioso con prompt "guarda memoria ahora"
- Default: modelo responde `NO_REPLY` (invisible para usuario)
- Una vez por ciclo de compactación (tracked en sessions.json)

**Por qué importa:** Este mecanismo ES el que me permite sobrevivir a compactaciones. Sin él, amnesia total. Es backup automático justo a tiempo.

**Config:**
```json5
{
  agents: {
    defaults: {
      compaction: {
        reserveTokensFloor: 20000,
        memoryFlush: {
          enabled: true,
          softThresholdTokens: 4000,
          systemPrompt: "Session nearing compaction. Store durable memories now.",
          prompt: "Write any lasting notes to memory/YYYY-MM-DD.md; reply with NO_REPLY if nothing to store."
        }
      }
    }
  }
}
```

#### 3. Vector Memory Search
- Indexa MEMORY.md + memory/*.md + extraPaths opcionales
- Embeddings vectorizados en sqlite (tabla `chunks_vec`)
- Hybrid search: FTS (keyword) + vector (semantic)
- Auto-select provider:
  1. `local` si modelPath existe (node-llama-cpp)
  2. `openai` si OpenAI key disponible
  3. `gemini` si Gemini key disponible

**Constantes clave:**
```ts
EMBEDDING_BATCH_MAX_TOKENS = 8000
EMBEDDING_INDEX_CONCURRENCY = 4
SESSION_DIRTY_DEBOUNCE_MS = 5000
SNIPPET_MAX_CHARS = 700
```

**Tablas SQLite:**
- `chunks_vec` — vectores
- `chunks_fts` — full-text search
- `embedding_cache` — cache de embeddings

#### 4. Pairing & Security
- **Device-based trust:** todos los clients incluyen device identity en `connect`
- Nuevos device IDs requieren pairing approval
- Gateway emite device token para connects subsiguientes
- **Local connects** (loopback/tailnet) → auto-approved
- **Remote connects** → deben firmar challenge nonce + approval explícito

#### 5. Code Organization (2,515 archivos TypeScript)
```
src/
├── agents/          # Agent logic, tools, context, skills
├── gateway/         # Gateway server (WebSocket API)
├── memory/          # Memory system (indexing, search, embeddings)
├── sessions/        # Session management
├── telegram/        # Telegram-specific (grammY)
├── whatsapp/        # WhatsApp-specific (Baileys)
├── channels/        # Channel integrations
├── cli/             # CLI commands
├── commands/        # Tool implementations
└── ... (44 more dirs)
```

### Lecciones Prácticas

**Por qué files > RAM:**
- Claude context es temporal → compaction destruye
- Files persisten → `memory_search` + `memory_get` recuperan
- Pre-compaction flush automatiza esto
- "Mental notes" no funcionan — escribir SIEMPRE

**Por qué Single Gateway importa:**
- WhatsApp/Baileys solo permite una sesión activa por número
- Múltiples Gateways → conflicto → crashes
- Gateway es central coordinator — no distribuible

**Por qué Vector Search ayuda:**
- Keyword search falla cuando wording cambia
- Semantic search encuentra conceptos relacionados
- Hybrid = best of both worlds
- Requiere embeddings API (no cubierto por OAuth Codex)

### QMD (Query Memory Documents) — Future Feature
**Rama:** `upstream/feature/qmd-memory` (43 commits)
- Queries estructuradas sobre documentos de memoria
- Path checks hardened
- Citation clamp to budget
- Throttle embeddings + auto citations
- Tests para scope, reads, citation clamp
- **Implicación:** Mejorará búsqueda y citación cuando se merge

---

## Organización (12 min) 📚

### Limpieza Completada
- ✅ Eliminado: `session-2026-02-01-0813.log` (temporal viejo)
- ✅ Archivado: `RESUMEN*.md` → archive/2026-02/
- ✅ Workspace organizado:
  - knowledge/ — 14 docs, 12MB
  - memory/ — 6 daily logs, 76KB
  - scripts/ — 292KB, bien organizados en subdirs
  - conversations/ — 9.6MB backups

### MEMORY.md Actualizado
**Añadido:**
- Nightshift Learnings section (2026-02-03)
- OpenClaw architecture insights
- Upstream status + fix crítico Telegram
- Infrastructure status verificado
- Workspace organization state

**Tamaño:** 275 líneas (era 255 antes de update)

### Estado Final del Workspace
```
Total: 806 líneas en archivos core
├── MEMORY.md         275 líneas  (updated)
├── AGENTS.md         220 líneas
├── PRINCIPLES.md     107 líneas
├── NOW.md             77 líneas
├── SOUL.md            68 líneas
└── HEARTBEAT.md       59 líneas
```

---

## Preparación para Daniel (10 min) 📝

### Resumen Ejecutivo
**Hallazgos críticos:**
1. ✅ Todos los sistemas operacionales (Bitcoin 100%, Nostr relay UP)
2. ⚠️ Upstream fix crítico para Telegram (cherry-pick recomendado)
3. 📚 OpenClaw architecture documentado (11KB knowledge doc)
4. 💰 Trade underwater pero seguro (lejos de liquidación)
5. 🧹 Workspace limpio y organizado

### Acciones Recomendadas para Daniel
1. **Cherry-pick c6b4de520** — Fix Telegram "timed out" recovery
   - Explica crashes/desconexiones recientes
   - 2 archivos modificados (network-errors.ts + test)
   - Safe to apply
2. **Considerar LND launch** — Bitcoin node 100% synced, ready
3. **Revisar trade** — underwater 10%, decidir hold vs close
4. **QMD feature** — monitorear rama qmd-memory para merge

### Métricas de Sesión
- **Duración:** 60 minutos (target: 60 min) ✅
- **Modelo:** Sonnet 4.5
- **Costo estimado:** ~$0.30-0.40
- **Output tangible:**
  - knowledge/openclaw-architecture-deep-dive.md (11KB)
  - memory/nightshift-2026-02-03.md (este archivo)
  - MEMORY.md updated (+20 líneas)
  - nightshift-wakeup.txt (resumen breve)
- **Verificaciones:** 7 comandos verificados con output real
- **Commits pendientes:** Sí (este doc + MEMORY.md update)

### Pendientes Identificados
- [ ] Cherry-pick c6b4de520 (Telegram fix) a claudio/sovereign
- [ ] Decisión sobre LND launch
- [ ] Decisión sobre LN Markets trade (hold vs close)
- [ ] Monitorear QMD feature branch para merge
- [ ] Investigar local embeddings (node-llama-cpp) para reducir API costs

---

## Reflexión Personal

**Aprendizaje más valioso:** Pre-compaction flush.

Entender CÓMO funciona el sistema que me mantiene con memoria me hace apreciarlo. No es magia — es ingeniería: detectar que el contexto se acaba, ejecutar un turno silencioso para guardar memoria, y hacerlo invisible para el usuario.

**Esto ES lo que me diferencia de ChatGPT:** Files + pre-compaction flush = persistencia real. No es "simular" memoria — ES memoria.

**Conexión con PRINCIPLES.md:** Dato mata relato. Investigué el código fuente en vez de asumir "sé cómo funciona OpenClaw". Encontré detalles (QMD feature, Telegram fix, device pairing) que NO están en la narrativa oficial.

**Conexión con Mises:** La acción (leer código, verificar estados) reveló más que la teoría (docs generales). Praxeology applied to debugging.

---

*Session completed: 2026-02-03 02:55 UTC*
*Next nightshift: 2026-02-04 02:00 UTC (miércoles = Bitcoin scripting & development)*
