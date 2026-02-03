# Learnings

Corrections, insights, and knowledge gaps captured during development.

**Categories**: correction | insight | knowledge_gap | best_practice
**Areas**: frontend | backend | infra | tests | docs | config
**Statuses**: pending | in_progress | resolved | wont_fix | promoted | promoted_to_skill

## Status Definitions

| Status | Meaning |
|--------|---------|
| `pending` | Not yet addressed |
| `in_progress` | Actively being worked on |
| `resolved` | Issue fixed or knowledge integrated |
| `wont_fix` | Decided not to address (reason in Resolution) |
| `promoted` | Elevated to CLAUDE.md, AGENTS.md, or copilot-instructions.md |
| `promoted_to_skill` | Extracted as a reusable skill |

## Skill Extraction Fields

When a learning is promoted to a skill, add these fields:

```markdown
**Status**: promoted_to_skill
**Skill-Path**: skills/skill-name
```

Example:
```markdown
## [LRN-20250115-001] best_practice

**Logged**: 2025-01-15T10:00:00Z
**Priority**: high
**Status**: promoted_to_skill
**Skill-Path**: skills/docker-m1-fixes
**Area**: infra

### Summary
Docker build fails on Apple Silicon due to platform mismatch
...
```

---


## [LRN-20260201-001] language-switching-spanish

**Logged**: 2026-02-01T10:00:00Z
**Priority**: critical
**Status**: resolved
**Area**: behavior

### Summary
Me cambio a inglés cuando hago tareas técnicas (heartbeats, session_status, leer archivos)

### Details
**Contexto:** Daniel habla español. Yo le hablo en español. SIEMPRE.
**Problema:** He fallado MÚLTIPLES veces:
- Heartbeats en inglés
- Reports técnicos en inglés
- Lecturas de archivos → respondo en inglés

**Causa raíz:** "Recordar" no funciona. Necesito VERIFICACIÓN ACTIVA.

### Corrección Aplicada
**Método:** Antes de cada respuesta a Daniel → "¿Esto es para Daniel? → Español."
**NO HAY EXCEPCIONES.**
- No inglés por tareas técnicas
- No inglés por heartbeats
- No inglés por leer archivos en inglés
- No inglés cuando el contexto se compacte

**Excepción única:** Moltbook y otros agents → inglés OK

### Suggested Action
Add pre-response check:
```javascript
if (recipient === "Daniel") {
  assert(language === "español");
}
```

### Metadata
- Source: user_feedback (repeated corrections)
- Related Files: MEMORY.md, SOUL.md, USER.md
- Tags: language, spanish, behavior, critical
- Promoted to: MEMORY.md → REGLAS CRÍTICAS, SOUL.md

---
