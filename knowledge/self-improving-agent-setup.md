# self-improving-agent Skill — Setup & Usage

**Instalado:** 2026-02-03 10:15 UTC  
**Versión:** 1.0.2 (txmerlxn fork)  
**Source:** openclaw-skills archive  
**ClawHub:** https://clawhub.ai → self-improving-agent (113 ⭐, 42 installs)

---

## Qué es

Sistema de logging estructurado para capturar:
- **Learnings** - Lecciones aprendidas, correcciones, best practices
- **Errors** - Fallos inesperados, crashes, bugs
- **Feature Requests** - Capabilities solicitadas que no existen

**Objetivo:** Continuous improvement, evitar repetir errores, seed development.

---

## Estructura

```
.learnings/
├── LEARNINGS.md         — Lecciones aprendidas
├── ERRORS.md            — Errores encontrados
├── FEATURE_REQUESTS.md  — Capabilities solicitadas
└── SKILL-TEMPLATE.md    — Template para nuevos skills
```

**Formato:** `[XXX-YYYYMMDD-NNN]` + structured markdown

---

## Cuándo usar

| Situación | Archivo | Categoría |
|-----------|---------|-----------|
| Comando falla | ERRORS.md | - |
| Usuario me corrige | LEARNINGS.md | `correction` |
| Usuario pide feature que no existe | FEATURE_REQUESTS.md | - |
| API/tool externa falla | ERRORS.md | - |
| Conocimiento desactualizado | LEARNINGS.md | `knowledge_gap` |
| Encuentro mejor approach | LEARNINGS.md | `best_practice` |

---

## Formato de Entrada

### Learning Entry (LEARNINGS.md)

```markdown
## [LRN-YYYYMMDD-XXX] category

**Logged**: ISO-8601 timestamp
**Priority**: low | medium | high | critical
**Status**: pending | resolved
**Area**: frontend | backend | infra | tests | docs | config | behavior

### Summary
One-line description

### Details
Full context: what happened, what was wrong, what's correct

### Corrección Aplicada (if resolved)
What I changed to fix it

### Suggested Action
Specific fix or improvement

### Metadata
- Source: conversation | error | user_feedback
- Related Files: path/to/file.ext
- Tags: tag1, tag2
- Promoted to: MEMORY.md, SOUL.md, etc.
- See Also: LRN-20250110-001 (if related)

---
```

### Error Entry (ERRORS.md)

```markdown
## [ERR-YYYYMMDD-XXX] skill_or_command_name

**Logged**: ISO-8601 timestamp
**Priority**: high
**Status**: pending | resolved
**Area**: infra | tools | api

### Summary
Brief description of what failed

### Error
```
Actual error message or output
```

### Context
- Command/operation attempted
- Input or parameters used
- Environment details

### Root Cause (if known)
Why it failed

### Resolution (if resolved)
How I fixed it

### Metadata
- Reproducible: yes | no | unknown
- Related Files: path/to/file.ext
- Tags: tag1, tag2
- Promoted to: MEMORY.md if important

---
```

---

## Scripts Disponibles

**Location:** `skills/self-improving-agent/scripts/`

| Script | Qué hace |
|--------|----------|
| `activator.sh` | Inicializa .learnings/ con templates |
| `error-detector.sh` | Detecta errores en outputs, auto-log |
| `extract-skill.sh` | Extrae skill definitions de learnings |

---

## Integración con mi Sistema

### Complementa MEMORY.md
- **MEMORY.md:** Long-term curated memory (distilled wisdom)
- **.learnings/:** Raw logs, granular, ephemeral
- **Flow:** .learnings/ → review → promote importante a MEMORY.md

### Promote Rules
- **MEMORY.md:** Critical rules, repeated mistakes, core learnings
- **SOUL.md:** Behavioral patterns, personality adjustments
- **TOOLS.md:** Tool gotchas, CLI tips
- **AGENTS.md:** Workflow improvements

---

## Entradas Iniciales Creadas

### ERR-20260201-001: nightshift-report-stale-data
**Problema:** Reporté Bitcoin node 81.4% cuando era 89.6%  
**Lección:** SIEMPRE verificar antes de reportar, no usar datos cached  
**Promoted to:** MEMORY.md → REGLAS CRÍTICAS

### LRN-20260201-001: language-switching-spanish
**Problema:** Me cambio a inglés en heartbeats/tareas técnicas  
**Lección:** VERIFICACIÓN ACTIVA: "¿Esto es para Daniel? → Español"  
**Promoted to:** MEMORY.md → REGLAS CRÍTICAS, SOUL.md

---

## Revisión Periódica

**Heartbeat integration (HEARTBEAT.md):**
```markdown
### Memory Maintenance (Every few days)
1. Read recent .learnings/*.md files
2. Identify significant patterns worth promoting
3. Update MEMORY.md with distilled learnings
4. Mark promoted entries with metadata
```

**Before major tasks:**
- Read relevant .learnings/ entries
- Check if similar mistakes already logged
- Avoid repeating errors

---

## Por Qué Funciona

1. **Structured logging** - No more "I should remember this"
2. **Searchable** - grep/ripgrep find patterns
3. **Timestamped** - Track when learnings happened
4. **Linked** - See Also connects related entries
5. **Actionable** - Suggested Action = clear next steps
6. **Promotable** - Best learnings → MEMORY.md/SOUL.md

---

## Diferencia vs MEMORY.md

| Aspecto | .learnings/ | MEMORY.md |
|---------|-------------|-----------|
| **Granularidad** | Raw, detailed | Curated, distilled |
| **Scope** | Specific incidents | General wisdom |
| **Lifetime** | Ephemeral (can prune) | Permanent |
| **Format** | Structured entries | Narrative prose |
| **Purpose** | Debug, prevent repeat | Long-term memory |

**Analogía:**
- .learnings/ = Daily notes (memory/YYYY-MM-DD.md)
- MEMORY.md = Long-term memory (curated)

---

## Next Steps

1. ✅ Instalado y configurado
2. ✅ Templates creados (.learnings/)
3. ✅ Entradas iniciales (2 errors/learnings)
4. [ ] Integrar con heartbeat review
5. [ ] Testear error-detector.sh script
6. [ ] Periodic promotion to MEMORY.md (weekly?)

---

**Generado:** 2026-02-03 10:16 UTC  
**Status:** ✅ Operational
