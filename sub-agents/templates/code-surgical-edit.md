# Template: Code Surgical Edit (Multiple Points in Existing File)

**Tipo:** 🟡 QUIRÚRGICA
**Score histórico:** 2/10 (1 uso, 108K tokens, sin resultado útil)
**Origen:** Sub-agente 45eb0b5b — i18n string replacement en bot.js (FALLÓ)

## Lecciones del Fracaso

El sub-agente intentó:
1. Script sed masivo → escaping hell, patrones no matcheaban
2. Se frustró → generó un "resumen" en vez de hacer el trabajo
3. Terminó PREGUNTANDO qué hacer (A/B/C) — 108K tokens gastados, 0 ediciones útiles

**Diagnóstico:** Tarea demasiado grande + herramienta equivocada (sed) + sin checkpoint

## ADN Mejorado (v2 — no probado aún)

### Estrategia: Dividir en micro-tareas

**NO dar la tarea completa.** Dividir en bloques de máximo 10-15 ediciones.

```
Edit the file `[FILE_PATH]` to make the following SPECIFIC replacements.

Use the `edit` tool (NOT sed, NOT scripts, NOT automation). Each edit is a find-and-replace of exact text.

CONTEXT: [Brief description of what the file does and what the edits achieve]

EDITS TO MAKE (in order):

1. Around line [N], find:
```[exact old text]```
Replace with:
```[exact new text]```

2. Around line [N], find:
...

[Max 10-15 edits per task]

AFTER ALL EDITS:
1. Syntax check: `[SYNTAX_CMD]`
2. If syntax fails → REVERT with `git checkout [FILE_PATH]` and report what went wrong
3. If syntax passes → `[COMMIT_CMD]`
4. Verify service: `[VERIFY_CMD]`

CRITICAL RULES:
- Use `edit` tool ONLY — no sed, no scripts, no automation
- The oldText in edit() must match EXACTLY (whitespace matters)
- If you can't find the exact text → STOP and report, don't guess
- Do NOT try to do more than asked
- Do NOT generate summaries — DO THE EDITS
```

## Por Qué Esta Versión Debería Funcionar

- **Micro-batches:** 10-15 ediciones, no 150
- **edit() tool directo:** sin capas de abstracción (sed, scripts)
- **Texto exacto provisto:** el sub-agente no tiene que buscar nada
- **Revert automático si falla:** git checkout como red de seguridad
- **"Do NOT generate summaries":** ataca directamente el modo de fallo observado

## Anti-Patterns CRÍTICOS

- ❌ **NUNCA dar >20 ediciones en una tarea** — dividir en subtareas
- ❌ **NUNCA dejar que use sed/awk/scripts** — edit() tool o nada
- ❌ **NUNCA dar la tarea sin el texto exacto** a buscar/reemplazar
- ❌ **NUNCA dejar que "resuma" en vez de hacer** — la instrucción debe prohibirlo explícitamente
- ❌ **NUNCA combinar edición con investigación** — son tareas distintas

## Preparación Necesaria (la hago yo antes de spawnar)

1. Leo el archivo y ubico las líneas exactas
2. Preparo los pares old/new text
3. Los pongo en el prompt con contexto de línea
4. El sub-agente solo ejecuta — no piensa, no decide

**Esto es trabajo de obrero, no de arquitecto. El prompt debe reflejar eso.**

## Variaciones

| Variación | Score | Notas |
|-----------|-------|-------|
| i18n 150 edits (sed) | 2/10 | Falló completamente |
| (v2 micro-batch) | ?/10 | Sin probar |

---

*Actualizado: 2026-02-05*
