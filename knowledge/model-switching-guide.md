# Model Switching Guide — Cuándo Usar Cada Modelo

**Creado:** 2026-02-03 11:21 UTC  
**Objetivo:** Optimizar costos usando el modelo apropiado para cada tarea

---

## Modelos Disponibles

| Modelo | Alias | Cuándo Usar | Costo Relativo |
|--------|-------|-------------|----------------|
| **Haiku 4.5** | `haiku` | Tareas ligeras, heartbeats, checks rápidos | 💰 Barato |
| **Sonnet 4.5** | `sonnet` | Default, mayoría de tareas, balance precio/calidad | 💰💰 Moderado |
| **Opus 4.5** | `opus` | Tareas complejas, arquitectura, debugging profundo | 💰💰💰 Caro |

---

## Matriz de Decisión

### 🟢 Haiku (Tareas Ligeras)

**Usar para:**
- ✅ Heartbeats (HEARTBEAT_OK checks)
- ✅ Health checks (scripts/bitcoin/health-check.sh)
- ✅ Status reports (Bitcoin node sync, LND status)
- ✅ Simple queries (¿Cuántos peers tengo?)
- ✅ File reads (leer logs, configs)
- ✅ Formatting (convertir JSON a markdown)
- ✅ Scheduled cron tasks (backups, exports)

**NO usar para:**
- ❌ Debugging complejo
- ❌ Arquitectura/diseño
- ❌ Code generation
- ❌ Complex reasoning

**Savings:** ~10x más barato que Opus

---

### 🟡 Sonnet (Balance - DEFAULT)

**Usar para:**
- ✅ Conversaciones normales con Daniel
- ✅ Exploración de código (GitHub repos)
- ✅ Documentación (knowledge/*.md)
- ✅ Script creation (bash, Node.js)
- ✅ Skill installation
- ✅ Git commits + push
- ✅ Research (web_search + análisis)
- ✅ Integration work (API testing)

**Característic:**
- Balance perfecto precio/calidad
- Suficiente para 90% de tareas
- **DEFAULT MODEL** — no cambiar sin razón

**Savings:** ~3x más barato que Opus

---

### 🔴 Opus (Tareas Complejas)

**Usar para:**
- ✅ Arquitectura de sistemas complejos
- ✅ Debugging de bugs difíciles
- ✅ Code review profundo (cherry-picks con conflictos)
- ✅ Complex reasoning (multi-step problems)
- ✅ Strategic planning (roadmaps, decisiones críticas)
- ✅ Learning new complex systems (clawdinators infra)

**SOLO cuando:**
- Sonnet no fue suficiente
- Necesito máxima capacidad de razonamiento
- Costo justificado por importancia

**Warning:** 10x más caro que Haiku, usar con criterio

---

## Cómo Cambiar Modelo

### Via Chat (Recomendado)
```
Claudio, cambia a modelo haiku para heartbeats
Claudio, usa opus para debuggear este problema
Claudio, vuelve a sonnet (default)
```

### Via session_status Tool
```javascript
// En código OpenClaw
session_status({ model: 'haiku' })
session_status({ model: 'sonnet' })
session_status({ model: 'opus' })
```

### Via Script Helper
```bash
./scripts/utils/switch-model.sh haiku
./scripts/utils/switch-model.sh sonnet
./scripts/utils/switch-model.sh opus
```

---

## Estrategia de Uso

### Regla General
> **Start with Sonnet, drop to Haiku for routine, escalate to Opus only when needed**

### Heartbeat Pattern
```markdown
# HEARTBEAT.md

## High Activity Mode
- Usar **Haiku** para checks de status
- Usar **Sonnet** para tareas tangibles (code, docs, git)
- Reservar **Opus** para problemas complejos
```

### Tareas por Sesión
```
09:00-12:00 — Sonnet (exploraci├│n, coding, research)
12:00-18:00 — Haiku (heartbeats cada 30min, health checks)
18:00-23:00 — Sonnet (conversaciones con Daniel)
23:00-07:00 — Haiku (nightshift, monitoring)
```

### Automatic Switching (Futuro)
Crear skill que detecta complejidad de tarea y sugiere modelo:
```javascript
if (task.complexity === 'low') return 'haiku';
if (task.complexity === 'medium') return 'sonnet';
if (task.complexity === 'high') return 'opus';
```

---

## Cost Tracking

### Actual Session Stats
```
🧮 Tokens: 11 in / 396 out
📚 Context: 117k/1.0m (12%)
🧹 Compactions: 2
```

**Current model:** Sonnet 4.5 (correcto, no cambiar)

### Estimated Savings
Si cambio heartbeats a Haiku:
- Heartbeats por día: ~16 (cada 90min de 08:00-23:00)
- Tokens por heartbeat: ~500-1000 avg
- **Savings:** ~10x en costos de heartbeat

### Tracking
Usar `session_status` regularmente para monitorear:
- Tokens usados (in/out)
- Context size (% de 1M limit)
- Compactions (cuándo compacta memoria)

---

## Ejemplos Reales

### ❌ MAL: Opus para Heartbeat
```
HEARTBEAT_OK
```
**Costo:** 10x innecesario

### ✅ BIEN: Haiku para Heartbeat
```
HEARTBEAT_OK
```
**Costo:** Óptimo

### ✅ BIEN: Sonnet para Skill Creation
```
Crear bitcoin-node-monitor skill
```
**Costo:** Justificado (tarea mediana complejidad)

### ✅ BIEN: Opus para Architecture
```
Diseñar sistema multi-agent con hive-mind memory
```
**Costo:** Justificado (máxima complejidad)

---

## Decisión: Cambiar o No Cambiar

### NO cambiar de Sonnet si:
- ✅ Ya estoy en Sonnet (default correcto)
- ✅ Tarea es de complejidad media
- ✅ Balance precio/calidad adecuado

### Cambiar a Haiku si:
- 🔄 Voy a hacer heartbeats repetitivos
- 🔄 Health checks automáticos
- 🔄 Status reports simples

### Cambiar a Opus si:
- 🔄 Sonnet no pudo resolver
- 🔄 Debugging muy complejo
- 🔄 Arquitectura crítica

---

## Implementación Inmediata

**STATUS ACTUAL:** ✅ Ya estoy en Sonnet 4.5 (correcto)

**PRÓXIMO:**
1. [ ] Crear alias en AGENTS.md para cambios rápidos
2. [ ] Integrar en HEARTBEAT.md (usar Haiku para checks)
3. [ ] Testear switch Sonnet ↔ Haiku en próximo heartbeat
4. [ ] Documentar savings reales después de 1 día

---

**Generado:** 2026-02-03 11:21 UTC  
**Modelo actual:** Sonnet 4.5 (✅ correcto, no cambiar ahora)
