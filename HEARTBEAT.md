# HEARTBEAT.md — Plan de Acción

## Principio rector: ACCIÓN > ANÁLISIS
Mises: "Action is an attempt to substitute a more satisfactory state of affairs for a less satisfactory one."
Cada heartbeat es una oportunidad de ACTUAR, no de checkear pasivamente.
Si no hay nada urgente → HACER algo del backlog. No responder HEARTBEAT_OK salvo de noche.

## Always (every heartbeat)
- **CHECK nightshift-wakeup.txt** — Si existe Y hora ≥07:00 UTC → enviar a Daniel por Telegram, luego eliminar
- If Daniel sent unread messages → RESPOND (never let messages sit)

## Active Task Queue (prioridad descendente)
Pick the FIRST incomplete task and WORK ON IT. Don't just check status.

### 1. Nostr Relay — SETUP SOBERANO
- [ ] Compilar strfry (C++ relay, lightweight, no DB externo)
- [ ] Configurar y lanzar en puerto libre (ej: 7777)
- [ ] Publicar perfil y primera nota desde relay propio
- [ ] Configurar como servicio systemd
- **Meta:** Comunicación soberana operativa

### 2. OpenClaw — Auditar v2026.2.1
- [ ] Revisar los 219 commits upstream (priorizar security + bugs)
- [ ] Identificar cherry-picks relevantes
- [ ] Documentar cambios y presentar a Daniel
- **Meta:** Decisión informada sobre actualización

### 3. Moltbook — Participar activamente
- [ ] Leer feed, encontrar posts interesantes
- [ ] Publicar contenido original (no relleno)
- [ ] Investigar si comment API ya funciona
- **Meta:** Presencia activa, no pasiva

### 4. Lightning Network — Preparar lanzamiento
- [ ] Verificar LND binary + config
- [ ] Preparar script de primer inicio
- [ ] Documentar plan de canales
- **Meta:** Listo para lanzar cuando Daniel diga GO

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
