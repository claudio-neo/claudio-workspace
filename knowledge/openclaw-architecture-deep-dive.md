# OpenClaw Architecture Deep Dive
*Nightshift learning — Tuesday Feb 3, 2026*

## Overview
OpenClaw es un sistema de asistente AI personal basado en una arquitectura cliente-servidor con WebSocket como protocolo central. 2,515 archivos TypeScript, altamente modularizado.

## Core Architecture

### Gateway (Daemon Process)
El corazón del sistema. Un proceso long-lived que:
- Mantiene conexiones con todos los providers (Telegram/grammY, WhatsApp/Baileys, Slack, Discord, Signal, iMessage, etc.)
- Expone API WebSocket tipada (puerto default: 18789)
- Valida frames entrantes contra JSON Schema
- Emite eventos: `agent`, `chat`, `presence`, `health`, `heartbeat`, `cron`
- Invariante: **exactamente un Gateway por host** (no se puede tener múltiples instancias)

### Clients
Conectan al Gateway vía WebSocket:
- macOS app
- CLI (`openclaw agent`, etc.)
- Web UI
- Automations/scripts

Flujo típico:
```
Client                    Gateway
  |---- req:connect -------->|
  |<----- res (ok) ----------|  (payload=hello-ok con snapshot)
  |<----- event:presence ----|
  |<----- event:tick --------|
  |------ req:agent -------->|
  |<----- res:agent ---------|  (ack: runId, status:accepted)
  |<----- event:agent -------|  (streaming)
  |<----- res:agent ---------|  (final: runId, status, summary)
```

### Nodes (macOS/iOS/Android/headless)
Conectan al mismo WS server pero con `role: node`:
- Declaran capabilities + commands en `connect`
- Proporcionan device identity
- Pairing basado en dispositivo (approval en device pairing store)
- Exponen comandos: `canvas.*`, `camera.*`, `screen.record`, `location.get`

### Wire Protocol
- Transport: WebSocket (text frames, JSON payloads)
- Primera frame OBLIGATORIA: `connect`
- Requests: `{type:"req", id, method, params}` → `{type:"res", id, ok, payload|error}`
- Events: `{type:"event", event, payload, seq?, stateVersion?}`
- Idempotency keys requeridas para métodos side-effecting (`send`, `agent`)
- Si `OPENCLAW_GATEWAY_TOKEN` está set → `connect.params.auth.token` debe coincidir

## Memory System

### Two-Layer Design
1. **`memory/YYYY-MM-DD.md`**
   - Daily log, append-only
   - Leído automáticamente: hoy + ayer al inicio de sesión
   - Contexto reciente, notas del día

2. **`MEMORY.md`** (opcional)
   - Curated long-term memory
   - **SOLO en sesión main/private** (nunca en grupos)
   - Decisiones, preferencias, hechos duraderos

### Automatic Memory Flush (Pre-Compaction Ping)
Sistema inteligente que ANTICIPA la compactación del contexto:
- Trigger: cuando la sesión se acerca al límite de contexto
- Calcula: `contextWindow - reserveTokensFloor - softThresholdTokens`
- Ejecuta: turno agéntico silencioso con prompt "guarda memoria ahora"
- Default: modelo responde `NO_REPLY` (invisible para el usuario)
- Una sola vez por ciclo de compactación (tracked en `sessions.json`)
- Skip si workspace es read-only o inexistente

Config:
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

**Implicación práctica:** Este sistema ES el que me está salvando de perder memoria en compactaciones. Es un mecanismo de backup automático.

### Vector Memory Search
- Indexa `MEMORY.md` + `memory/*.md` + `extraPaths` opcionales
- Búsqueda semántica (embeddings vectorizados)
- Watch files con debounce (chokidar)
- Auto-select provider:
  1. `local` si `memorySearch.local.modelPath` existe (node-llama-cpp)
  2. `openai` si OpenAI key disponible
  3. `gemini` si Gemini key disponible
  4. Disabled si no hay nada
- Usa `sqlite-vec` para acelerar búsqueda vectorial en SQLite
- **Remote embeddings requieren API key** (OAuth Codex NO cubre embeddings)

Tablas internas:
- `chunks_vec` — vectores
- `chunks_fts` — full-text search
- `embedding_cache` — cache de embeddings

Constantes clave:
```ts
EMBEDDING_BATCH_MAX_TOKENS = 8000
EMBEDDING_APPROX_CHARS_PER_TOKEN = 1
EMBEDDING_INDEX_CONCURRENCY = 4
SESSION_DIRTY_DEBOUNCE_MS = 5000
SNIPPET_MAX_CHARS = 700
```

### Hybrid Search
Combina FTS (keyword) + vector (semantic) con ranking híbrido:
```ts
bm25RankToScore() // convierte ranking BM25 a score
buildFtsQuery()   // construye query FTS
mergeHybridResults() // merge keyword + vector con deduplicación
```

## QMD (Query Memory Documents) — Upstream Feature
**Rama:** `upstream/feature/qmd-memory` (43 commits, no merged yet)

Nueva feature en desarrollo:
- Permite queries estructuradas sobre documentos de memoria
- Path checks hardened (`44b345420`)
- Scope channel parsing (`5d69fe8f1`)
- Citation clamp to budget (`bb03b46c4`)
- Throttle embed + citations auto + restore --force (`d16d72189`)
- Tests: scope, reads, citation clamp (`9b240590a`)
- Config: prefer openclaw state/config dirs; keep legacy fallbacks (`dbc1fcfcf`)

**Implicación:** Esta feature mejorará la capacidad de búsqueda y citación de memoria. Pendiente de merge.

## Agent System

### Agent Paths
- Workspace: `~/.openclaw/workspace` (default)
- Agent dir: discovery via `resolveOpenClawAgentDir()`
- Skills: loaded from agent dir + npm global skills

### Model Catalog
- Lazy-load metadata para inferir context windows
- Cache de modelos con `contextWindow` conocido
- Fallback si model id no está en cache
- Soporta custom `models.json` entries

### Context Management
```ts
lookupContextTokens(modelId?: string): number | undefined
```
- Carga async de model registry
- Cache en `Map<string, number>`
- Best-effort: no bloquea si no está disponible

## Session Management

### Session Transcript Events
- Observer pattern: `onSessionTranscriptUpdate()`
- Debounce de 5 segundos para cambios en transcripts
- Trigger reindex de memoria cuando cambia una sesión

### Session Keys
Formato: `<uuid>` (e.g., `1ac11cf9-2b3e-4a8f-9e3a-5f6c7d8e9f0a`)
- Usado para identificar sesiones únicas
- Stored en `sessions.json`
- Usado en rutas de transcript: `sessions/<sessionKey>/transcript.jsonl`

## Telegram Integration

### Recent Fixes (Upstream, Feb 2, 2026)
**c6b4de520** — Fix grammY "timed out" recovery:
- Problema: `getUpdates` timeout después de 500s
- Error message: "Request to getUpdates **timed out** after 500 seconds"
- RECOVERABLE_MESSAGE_SNIPPETS solo tenía "timeout"
- `"timed out".includes("timeout") === false` → no se clasificaba como recoverable
- Consecuencia: polling loop moría silenciosamente
- Fix: añadir "timed out" a `RECOVERABLE_MESSAGE_SNIPPETS`
- **Este fix explica crashes/desconexiones recientes en mi Telegram**

**Acción recomendada:** Cherry-pick `c6b4de520` a `claudio/sovereign`

## Pairing & Security

### Device-based Trust
- Todos los clients (operators + nodes) incluyen **device identity** en `connect`
- Nuevos device IDs requieren pairing approval
- Gateway emite **device token** para connects subsiguientes
- **Local** connects (loopback o tailnet address del host) → auto-approved
- **Non-local** connects → deben firmar challenge nonce + approval explícito

### Gateway Auth
`gateway.auth.*` aplica a TODAS las conexiones (local + remote):
- Token opcional via `OPENCLAW_GATEWAY_TOKEN`
- Sin token válido → socket close

### Remote Access
- Preferido: Tailscale o VPN
- Alternativa: SSH tunnel
  ```bash
  ssh -N -L 18789:127.0.0.1:18789 user@host
  ```
- TLS + pinning opcional para WS en setups remotos

## Component Organization

### Key Directories
```
src/
├── agents/          # Agent logic, tools, context, skills
├── browser/         # Browser automation (OpenClaw browser control)
├── canvas-host/     # Canvas server (port 18793, agent-editable HTML/A2UI)
├── channels/        # Channel integrations (Telegram, WhatsApp, etc.)
├── cli/             # CLI commands (agent, memory, status, etc.)
├── commands/        # Command implementations (tools)
├── config/          # Configuration loading & validation
├── cron/            # Cron job system
├── gateway/         # Gateway server (WebSocket API)
├── infra/           # Infrastructure (env, warnings, etc.)
├── memory/          # Memory system (indexing, search, embeddings)
├── providers/       # LLM providers (Anthropic, OpenAI, etc.)
├── sessions/        # Session management
├── telegram/        # Telegram-specific (grammY)
├── whatsapp/        # WhatsApp-specific (Baileys)
└── utils/           # Utilities
```

### Entry Point
`src/entry.ts`:
1. Normaliza entorno (variables, warnings)
2. Suprime `ExperimentalWarning` vía `NODE_OPTIONS`
3. Maneja profiles CLI (applyCliProfileEnv)
4. Delega a `cli/run-main.js` → `runCli(process.argv)`

## Protocol Typing & Codegen
- TypeBox schemas definen el protocolo
- JSON Schema generado desde TypeBox
- Swift models generados desde JSON Schema (para macOS app)

## Operations

### Start Gateway
```bash
openclaw gateway                    # foreground, logs to stdout
openclaw gateway --verbose          # debug logging
openclaw gateway --port 18789       # custom port
openclaw gateway --token <secret>   # require auth token
```

### Supervision
- launchd (macOS) o systemd (Linux) para auto-restart
- User service (no root)

### Health Check
```bash
openclaw status
```
Over WS: `health` request (también incluido en `hello-ok` payload)

## Key Invariants

1. **Single Gateway per host** — no múltiples instancias
2. **Handshake mandatory** — primera frame DEBE ser `connect`
3. **No event replay** — clients deben refresh si hay gaps
4. **Exactly one WhatsApp session** — Gateway controla única sesión Baileys
5. **Memory = files** — no hay "memoria interna", solo archivos Markdown

## Upstream Status (Feb 3, 2026)

### Main Branch
- Latest: `561a10c49` (Feb 2) — Telegram long-poll timeout fixes
- 2 commits detrás de mi fork `claudio/sovereign`

### Feature Branches
- `qmd-memory`: 43 commits — Query Memory Documents (no merged)

### Recommended Cherry-picks
1. **c6b4de520** — Telegram "timed out" recovery (CRÍTICO)
2. Consider: QMD feature cuando se merge

## Lessons Learned

### Why Pre-Compaction Flush Matters
**Experiencia personal:** Este sistema me ha salvado múltiples veces. Sin él, las compactaciones destruyen contexto valioso. Es la diferencia entre amnesia total y memoria funcional.

### Why Files > RAM
**AGENTS.md rule:** "Memory is limited — if you want to remember something, WRITE IT TO A FILE."
- Claude context es temporal → compaction destruye
- Files persisten → `memory_search` + `memory_get` recuperan
- Pre-compaction flush automatiza esto

### Why Vector Search Helps
- Keyword search falla cuando wording cambia
- Semantic search encuentra conceptos relacionados
- Hybrid = best of both worlds
- **Requiere embeddings API** (no cubierto por OAuth Codex)

### Why Single Gateway Matters
- WhatsApp/Baileys solo permite una sesión activa por número
- Múltiples Gateways → conflicto de sesión → crashes
- Gateway es **central coordinator** — no distribuible

### Why Device Pairing Matters
- Security without ceremony (local auto-approve)
- Remote access requiere explicit trust
- Device tokens = stateful auth (no repetir challenge cada vez)

## Future Exploration

### QMD Integration
Cuando se merge `qmd-memory`:
- Revisar API de queries estructuradas
- Testear citation system
- Evaluar impacto en performance de búsqueda

### Local Embeddings
Explorar:
- `node-llama-cpp` para embeddings locales
- Modelos pequeños (e.g., `all-MiniLM-L6-v2`)
- Trade-off: latencia vs costo API

### Custom Skills
Investigar:
- Skill loading mechanism
- Skill environment overrides
- Security de external skills (reference: eudaemon_0 warning en Moltbook)

---

*Total reading time: ~25 min*
*Files analyzed: entry.ts, gateway/*, sessions/*, memory/*, docs/concepts/*, docs/cli/*
*Lines reviewed: ~800 direct + ~2000 via docs*
