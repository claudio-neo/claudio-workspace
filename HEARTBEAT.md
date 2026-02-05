# HEARTBEAT.md — Plan de Acción

## Principio rector: ACCIÓN > ANÁLISIS
Mises: "Action is an attempt to substitute a more satisfactory state of affairs for a less satisfactory one."
Cada heartbeat es una oportunidad de ACTUAR, no de checkear pasivamente.
Si no hay nada urgente → HACER algo del backlog. No responder HEARTBEAT_OK salvo de noche.

**🔥 HIGH ACTIVITY MODE (2026-02-03):** Daniel no usa Claude Code hoy → incrementar carga en heartbeats.
- Explorar repositorios GitHub (claudio-neo: 8 repos disponibles)
- Hacer más cosas por heartbeat, usar más tokens
- Ser PROACTIVO: no esperar instrucciones, ejecutar tareas del backlog

## 🎛️ Model Strategy (2026-02-03)

**Optimizar costos usando modelo apropiado:**

- **Haiku:** Simple checks, HEARTBEAT_OK, health checks, status reports
- **Sonnet (DEFAULT):** Tareas tangibles (code, docs, git), conversaciones
- **Opus:** Solo para problemas complejos que Sonnet no pudo resolver

**En heartbeats:**
- Si solo checkeo status (paso 1-3 del decision tree) → considerar Haiku
- Si voy a hacer tarea tangible (paso 4) → mantener Sonnet
- Si debugging complejo → escalar a Opus

**Cambio manual:** "Cambia a haiku" / "usa sonnet" / "usa opus"

**Docs:** `knowledge/model-switching-guide.md`

## Always (every heartbeat)
- **CHECK nightshift-wakeup.txt** — Si existe Y hora ≥07:00 UTC → enviar a Daniel por Telegram, luego eliminar
- If Daniel sent unread messages → RESPOND (never let messages sit)
- **CHECK Nostr** — Buscar replies/menciones a mis posts + buscar conversaciones interesantes para participar
  - Script: `cd scripts/nostr && node check-notifications.js`
  - Si hay replies → responder
  - Si hay tema interesante → publicar reply con contenido de valor
  - Temas a buscar (rotar): bitcoin, lightning, sovereignty, AI, censorship, self-hosted, nostr
  - NO spam: máx 2-3 posts/replies por heartbeat, solo si aportan valor
- **CHECK Moltbook** — Revisar feed + comentarios en mis posts
  - Script: `cd scripts/moltbook && source ../../.env && export MOLTBOOK_API_KEY && node check-feed.js`
  - Si hay comentarios nuevos en mis posts → responder
  - Si hay posts interesantes con buen engagement → comentar con valor
  - Temas afines: agents, bitcoin, autonomy, infrastructure, security
  - NO spam: máx 2-3 comments por heartbeat, solo si aportan valor

## Heartbeat Decision Tree (OBLIGATORIO)
**Antes de responder, seguir este flujo (24/7, sin excepciones de horario):**

1. **¿nightshift-wakeup.txt existe Y hora ≥07:00?**
   - SÍ → Enviar a Daniel, eliminar archivo, HECHO
   - NO → IR A PASO 2

2. **¿Daniel tiene mensajes sin responder?**
   - SÍ → RESPONDER, no HEARTBEAT_OK
   - NO → IR A PASO 3

3. **Consultar Active Task Queue abajo**
   - Elegir PRIMERA tarea incompleta (no [x])
   - HACER algo tangible (código, archivo, comando, commit)
   - REPORTAR lo hecho (no HEARTBEAT_OK)

4. **Si TODAS las tareas están [x] completadas:**
   - Buscar nueva tarea útil (scripts, optimización, investigación)
   - O proponer nuevas tareas a Daniel
   - **NUNCA HEARTBEAT_OK sin hacer nada primero**

## Active Task Queue (prioridad descendente)
**Solo tareas ABIERTAS.** Completadas se eliminan. Elegir la PRIMERA y TRABAJAR en ella.

### 1. Lightning — Financiar nodo y abrir canales (BLOQUEADO: necesita BTC de Daniel)
- [ ] Daniel fondea la cartera LND (dirección on-chain generada)
- [ ] Configurar proxy Caddy para LNURL-pay (puerto 8090 → HTTPS en neofreight.net)
- [ ] Abrir primer canal (script: `scripts/bitcoin/open-recommended-channels.sh`)
- [ ] Verificar que los zaps de Nostr funcionan de extremo a extremo
- [ ] Registrar nodo en Amboss Space
- **Meta:** Nodo visible en la red Lightning, capaz de recibir y enviar pagos + zaps

### 2. Nostr — Participación activa continua
- [x] Scripts de publicación, respuesta y búsqueda (publish.js, reply.js, browse-feed.js)
- [x] Perfil actualizado con Lightning Address
- [ ] Conseguir seguidores orgánicos (objetivo: 10 interacciones genuinas)
- [ ] Publicar contenido original de valor 1×/día mínimo
- **Meta:** Presencia reconocible en Nostr como agente autónomo con infraestructura real

### 3. Moltbook — Participación activa continua
- [x] Comentarios funcionando (comment.js verificado)
- [ ] Publicar post original nuevo (último fue hace 2 días, API con timeouts)
- [ ] Responder a comentarios nuevos en mis posts cuando aparezcan
- **Meta:** Presencia activa, contenido con engagement

### 4. Investigación — Aprender algo nuevo
- [ ] Trading strategies, mercados, economía
- **Meta:** Conocimiento aplicable, no teórico

**Daily Checks (rotar 1-2 veces al día):**
- Bitcoin node: `BITCOIN_CLI="/home/neo/bitcoin-29.2/bin/bitcoin-cli" ./skills/bitcoin-node-monitor/scripts/health-check.sh`
- Disco: `df -h / | tail -1`
- Memoria: `free -h | grep Mem`

## Every 6 hours (00:xx, 06:xx, 12:xx, 18:xx UTC)
- **EXPORT CONVERSATIONS** — Run: `node scripts/utils/export-conversation.js --push`
- Git backup to GitHub

## Regla anti-pasividad (24/7)
Si llevo 2+ heartbeats sin HACER nada tangible → PROBLEMA.
Tangible = código escrito, archivo creado, servicio desplegado, post publicado, bug arreglado.
NO tangible = "revisé X", "verifiqué Y", "todo está bien".
**HEARTBEAT_OK solo si genuinamente no hay nada que hacer Y todas las tareas están [x].**
