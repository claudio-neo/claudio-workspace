# Template: Research (Web → Summary/File)

**Tipo:** 🟢 ATÓMICA
**Score histórico:** Sin datos aún
**Origen:** Extrapolado de tareas de investigación exitosas en sesión principal

## ADN Base

```
Research [TOPIC] and produce a comprehensive summary.

SOURCES TO CHECK:
1. [URL or search query 1]
2. [URL or search query 2]
3. [General web search for: "query"]

OUTPUT: Write findings to `[OUTPUT_PATH]` in this format:

# [TOPIC] Research
**Date:** [TODAY]
**Sources:** [list URLs consulted]

## Key Findings
- [bullet points with specifics]

## Analysis
[2-3 paragraphs of synthesis]

## Raw Data
[relevant quotes, numbers, links]

RULES:
- Include SOURCES for every claim
- Distinguish between facts and opinions
- If conflicting info found, present BOTH sides
- If info is uncertain, say so explicitly
- Do NOT fabricate data
- Do NOT pad with generic filler
```

## Por Qué Debería Funcionar

- **Input definido:** URLs + queries
- **Output definido:** archivo con formato fijo
- **Sin side-effects:** solo lectura + escritura
- **Validación:** fuentes verificables en el output

## Anti-Patterns

- ❌ NO pedir investigación + implementación en la misma tarea
- ❌ NO dejar scope abierto ("investiga todo sobre X")
- ❌ NO pedir opiniones sin especificar framework de análisis

---

*Creado: 2026-02-05*
