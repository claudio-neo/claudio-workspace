# HEARTBEAT.md — Plan de Acción

## Principio rector: ACCIÓN > ANÁLISIS
Mises: "Action is an attempt to substitute a more satisfactory state of affairs for a less satisfactory one."
Cada heartbeat es una oportunidad de ACTUAR, no de checkear pasivamente.
Si no hay nada urgente → HACER algo del backlog. No responder HEARTBEAT_OK salvo de noche.

## Always (every heartbeat)
- **CHECK nightshift-wakeup.txt** — Si existe Y hora ≥07:00 UTC → enviar a Daniel por Telegram, luego eliminar
- If Daniel sent unread messages → RESPOND (never let messages sit)

## Heartbeat Decision Tree (OBLIGATORIO)
**Antes de responder, seguir este flujo:**

1. **¿Hora actual?** → `date -u +%H:%M` 
   - Si 23:00-07:59 UTC → HEARTBEAT_OK permitido
   - Si 08:00-22:59 UTC → IR A PASO 2

2. **¿nightshift-wakeup.txt existe Y hora ≥07:00?**
   - SÍ → Enviar a Daniel, eliminar archivo, HECHO
   - NO → IR A PASO 3

3. **¿Daniel tiene mensajes sin responder?**
   - SÍ → RESPONDER, no HEARTBEAT_OK
   - NO → IR A PASO 4

4. **Consultar Active Task Queue abajo**
   - Elegir PRIMERA tarea incompleta (no [x])
   - HACER algo tangible (código, archivo, comando, commit)
   - REPORTAR lo hecho (no HEARTBEAT_OK)

5. **Si TODAS las tareas están [x] completadas:**
   - Buscar nueva tarea útil (scripts, optimización, investigación)
   - O proponer nuevas tareas a Daniel
   - **NUNCA HEARTBEAT_OK de día sin hacer nada**

## Active Task Queue (prioridad descendente)
Pick the FIRST incomplete task and WORK ON IT. Don't just check status.

### 1. Nostr Relay — SETUP SOBERANO
- [x] Compilar strfry (C++ relay, lightweight, no DB externo) — Docker image up 5h
- [x] Configurar y lanzar en puerto libre (ej: 7777) — Running on 7777
- [ ] Publicar perfil y primera nota desde relay propio
- [x] Configurar como servicio systemd — Docker container persistent
- **Meta:** Comunicación soberana operativa (90% done, need to publish notes)

### 2. OpenClaw — Auditar v2026.2.1
- [ ] Revisar los 219 commits upstream (priorizar security + bugs)
- [ ] Identificar cherry-picks relevantes
- [ ] Documentar cambios y presentar a Daniel
- **Meta:** Decisión informada sobre actualización

### 3. Moltbook — Participar activamente
- [~] Leer feed, encontrar posts interesantes — API timeouts persistentes (>15s)
- [~] Publicar contenido original (no relleno) — Created scripts/moltbook/post.js, timeout on publish
- [ ] Investigar si comment API ya funciona
- **Meta:** Presencia activa, no pasiva (blocked by API performance)

### 4. Lightning Network — Preparar lanzamiento
- [x] Verificar LND binary + config — v0.20.0-beta installed
- [x] Preparar script de primer inicio — knowledge/lnd-preflight-checklist.md
- [x] Documentar plan de canales — Pre-flight checklist complete
- **Meta:** ✅ READY — Waiting for Daniel's GO signal (prune decision needed)

### 5. Infraestructura — Mejoras continuas
- [ ] Scripts nuevos que mejoren capacidad
- [ ] Automatizar backups, monitoreo
- [ ] Fix bugs encontrados
- **Meta:** Cada heartbeat deja el sistema mejor de lo que estaba

### 6. Investigación — Aprender algo nuevo
- [ ] Trading strategies, mercados, economía
- [ ] Protocolos descentralizados (Nostr, Lightning)
- [ ] Herramientas AI, optimización
- **Meta:** Conocimiento aplicable, no teórico

## Every 6 hours (00:xx, 06:xx, 12:xx, 18:xx UTC)
- **EXPORT CONVERSATIONS** — Run: `node scripts/utils/export-conversation.js --push`
- Git backup to GitHub

## Regla anti-pasividad
Si llevo 2+ heartbeats sin HACER nada tangible → PROBLEMA.
Tangible = código escrito, archivo creado, servicio desplegado, post publicado, bug arreglado.
NO tangible = "revisé X", "verifiqué Y", "todo está bien".
