# ClawHub Top Skills Analysis

**Fecha:** 2026-02-03 09:14 UTC  
**Fuente:** https://clawhub.ai/api/v1/skills?sort=stars  
**Top 10 por stars**

---

## 1. self-improving-agent (113 ⭐)

**Slug:** `self-improving-agent`  
**Instalaciones:** 42 actuales, 46 total  
**Downloads:** 12,357

**Qué hace:**
Sistema de aprendizaje continuo que captura:
- Errores y fallos inesperados
- Correcciones del usuario ("No, eso está mal...")
- Capabilities solicitadas que no existen
- APIs/tools que fallan
- Conocimiento desactualizado
- Mejores enfoques para tareas recurrentes

**Cuándo usar:**
- Antes de tareas importantes (revisar learnings)
- Después de errores
- Cuando el usuario corrige
- Cuando descubro algo nuevo

**Por qué importa:**
- Evita repetir errores
- Memoria de largo plazo de lecciones aprendidas
- Mejora continua sin intervención humana

**Acción:** ⭐ INSTALAR - Complementa perfectamente mi sistema de MEMORY.md

---

## 2. coding-agent (43 ⭐)

**Slug:** `coding-agent`  
**Instalaciones:** 80 actuales  
**Downloads:** 5,458

**Qué hace:**
Control programático de coding agents:
- Codex CLI
- Claude Code
- OpenCode
- Pi Coding Agent

**Background process control** para lanzar agents en segundo plano.

**Por qué importa:**
- Puedo delegar tareas de código a sub-agents especializados
- Control asíncrono (no bloquea mi conversación)

**Acción:** Evaluar cuando necesite generación intensiva de código

---

## 3. clawddocs (39 ⭐)

**Slug:** `clawddocs`  
**Instalaciones:** 22 actuales  
**Downloads:** 3,903

**Qué hace:**
Experto en documentación Clawdbot con:
- Decision tree navigation
- Search scripts
- Doc fetching
- Version tracking
- Config snippets

**Por qué importa:**
- Respuestas rápidas sobre features de OpenClaw/Clawdbot
- Snippets de configuración listos para usar

**Acción:** Útil para consultas sobre features que no conozco

---

## 4. gog (39 ⭐)

**Slug:** `gog`  
**Instalaciones:** 94 actuales  
**Downloads:** 8,349

**Qué hace:**
Google Workspace CLI completo:
- Gmail
- Calendar
- Drive
- Contacts
- Sheets
- Docs

**Por qué importa:**
- Daniel usa Google Calendar (potencial integración)
- Mi email es IONOS, no Gmail (menos útil para email)
- Podría usar Calendar para recordatorios/eventos

**Acción:** Evaluar si Daniel quiere integración con su Google Calendar

---

## 5. caldav-calendar (38 ⭐)

**Slug:** `caldav-calendar`  
**Instalaciones:** 15 actuales  
**Downloads:** 3,023

**Qué hace:**
Sincronización CalDAV (iCloud, Google, Fastmail, Nextcloud) usando:
- vdirsyncer (sync)
- khal (query)

**Plataforma:** Linux only

**Por qué importa:**
- Alternativa a Google Calendar API
- Funciona con múltiples providers
- Estoy en Linux → compatible

**Acción:** Considerar si Daniel quiere integración de calendario

---

## 6. byterover (31 ⭐)

**Slug:** `byterover`  
**Instalaciones:** 5 actuales  
**Downloads:** 15,091 (alto download pero bajo installs → mucha gente lo probó)

**Qué hace:**
Gestión de conocimiento con ByteRover context tree:
- **query:** Retrieve knowledge
- **curate:** Store knowledge

**Developer:** ByteRover Inc. (https://byterover.dev/)

**Por qué importa:**
- Sistema de gestión de conocimiento estructurado
- Alternativa/complemento a mi sistema memory/

**Acción:** Investigar si ofrece algo que memory_search no tiene

---

## 7. auto-updater (29 ⭐)

**Slug:** `auto-updater`  
**Instalaciones:** 27 actuales  
**Downloads:** 5,205

**Qué hace:**
Updates automáticos diarios vía cron:
- Actualiza Clawdbot/OpenClaw
- Actualiza todos los skills instalados
- Envía resumen al usuario con changelog

**Por qué importa:**
- Automatiza mantenimiento
- Usuario informado de cambios

**⚠️ CONFLICTO con mi filosofía:**
Mi REGLA: Auditar SIEMPRE antes de actualizar (ver MEMORY.md)
- NO quiero actualizaciones automáticas de OpenClaw
- Los proyectos pueden ser contaminados

**Acción:** ❌ NO INSTALAR - Contra mi política de seguridad

---

## 8. proactive-agent (27 ⭐)

**Slug:** `proactive-agent`  
**Instalaciones:** 6 actuales  
**Downloads:** 4,048

**Qué hace:**
Patrones de agente proactivo:
- **Memory architecture** con pre-compaction flush
- **Reverse prompting** (ideas no solicitadas)
- **Security hardening**
- **Self-healing** (diagnostica y arregla problemas)
- **Alignment systems** (misión, valores)

**Por qué importa:**
- Patrones battle-tested
- Pre-compaction flush = exactamente lo que tengo
- Self-healing = útil para autonomía

**Acción:** ⭐ LEER - Puede tener patrones que no conozco

---

## 9. agent-browser (27 ⭐)

**Slug:** `agent-browser`  
**Instalaciones:** 31 actuales  
**Downloads:** 7,241

**Qué hace:**
Browser automation headless en Rust (con fallback Node.js):
- Navigate, click, type, snapshot
- Comandos estructurados
- Video recording
- Mouse control
- Semantic locators

**Por qué importa:**
- Rust = rápido
- Fallback Node.js = portable
- Alternativa al browser tool built-in de OpenClaw

**Acción:** Evaluar si es más rápido/confiable que browser tool nativo

---

## 10. wacli (27 ⭐)

**Slug:** `wacli`  
**Instalaciones:** 64 actuales  
**Downloads:** 12,705

**Qué hace:**
WhatsApp CLI:
- Enviar mensajes a otras personas
- Search/sync WhatsApp history

**⚠️ Nota:** "not for normal user chats"

**Por qué importa:**
- Daniel no usa WhatsApp conmigo (usamos Telegram)
- Podría ser útil para enviar WhatsApp a terceros

**Acción:** No prioritario (usamos Telegram)

---

## Skills Adicionales (Siguiente Página)

La API devuelve `nextCursor` para paginar. Hay más skills disponibles con menos stars pero potencialmente útiles.

**Próximas exploraciones:**
- Skills de Bitcoin/Lightning
- Skills de trading
- Skills de Nostr
- Skills de monitoring/alertas

---

## Decisiones Inmediatas

### ✅ INSTALAR
1. **self-improving-agent** - Sistema de aprendizaje continuo (complementa MEMORY.md)
2. **proactive-agent** - Patrones de proactividad (leer primero para evitar duplicar)

### 🔍 EVALUAR
3. **gog** - Si Daniel quiere integración Google Calendar
4. **caldav-calendar** - Alternativa CalDAV multi-provider
5. **agent-browser** - Si browser nativo no es suficiente

### ❌ RECHAZAR
6. **auto-updater** - Contra mi política de auditoría manual

---

## Método de Instalación

```bash
# Vía OpenClaw CLI
openclaw skills install self-improving-agent
openclaw skills install proactive-agent

# O vía clawhub CLI (si tengo)
clawhub sync self-improving-agent
```

**Nota:** Necesito verificar que tengo el CLI correcto instalado.

---

## Stats Interesantes

**Total skills vistos:** 10  
**Downloads promedio:** 7,938  
**Stars promedio:** 43.3  
**Instalaciones actuales promedio:** 42.6

**Insight:** Skills con muchos downloads pero pocas instalaciones actuales → mucha gente los probó y desinstalóla ratio downloads/installs muy alto indica skills "de prueba" vs skills "de producción"

**Skills "de producción" (ratio bajo):**
- coding-agent: 5,458 downloads / 80 installs = 68:1
- gog: 8,349 / 94 = 89:1
- wacli: 12,705 / 64 = 198:1

**Skills "de prueba" (ratio alto):**
- byterover: 15,091 / 5 = 3,018:1 (muchos probaron, casi nadie se quedó)
- self-improving-agent: 12,357 / 42 = 294:1

---

**Próximo paso:** Instalar self-improving-agent y leer proactive-agent para aprender patrones.
