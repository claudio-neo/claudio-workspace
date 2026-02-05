# Sub-Agent Selection Protocol

## Principio: Selección Artificial de ADN

Los sub-agentes no tienen memoria, consecuencias ni reputación.
Compensamos eso con **selección de prompts ganadores** — el ADN que produce buenos resultados se reutiliza, el que falla se descarta.

## Flujo

```
1. Nueva tarea → ¿existe template para este tipo?
   SÍ → usar template + adaptar detalles específicos
   NO → crear prompt desde cero, evaluar resultado
   
2. Sub-agente termina → evaluar resultado (0-10)
   
3. Score ≥ 7 → guardar prompt como template (o actualizar existente)
   Score < 7 → documentar el FALLO en el template (qué NO hacer)
   
4. Template evoluciona con cada iteración
```

## Taxonomía de Tareas

### 🟢 ATÓMICAS (alto éxito en sub-agentes)
- Leer archivo → transformar → escribir archivo nuevo
- Traducción, formateo, generación de contenido
- Investigación web → resumen
- **Patrón:** input claro → output claro, sin estado compartido

### 🟡 QUIRÚRGICAS (éxito medio, necesita buen template)
- Editar archivo existente (múltiples puntos)
- Refactoring de código
- **Patrón:** necesita contexto del archivo, escaping, validación post-edit

### 🔴 COMPLEJAS (bajo éxito, mejor hacerlo yo)
- Multi-archivo con dependencias
- Debugging con estado del sistema
- Tareas que requieren juicio o decisiones en cadena
- **Patrón:** si falla un paso, los siguientes fallan en cascada

## Reglas del Template

1. **Ser ESPECÍFICO** — no "haz i18n", sino "reemplaza estas 15 líneas exactas"
2. **Incluir validación** — `node -c`, tests, checks al final
3. **Incluir anti-patterns** — "NO uses sed para esto", "NO intentes automatizar con scripts"
4. **Definir output esperado** — qué archivos, qué formato, qué criterio de éxito
5. **Un commit por tarea** — facilita revert si falla

## Scoring

| Score | Significado | Acción |
|-------|-------------|--------|
| 9-10  | Perfecto, sin intervención | Template se guarda tal cual |
| 7-8   | Funcionó con ajustes menores | Template se guarda con notas |
| 4-6   | Parcial, requirió mucho trabajo mío | Template se reescribe |
| 0-3   | Falló, gasté tokens sin resultado | Documentar anti-pattern |

## Métricas por Template

En `history/scores.json`:
```json
{
  "template_name": {
    "uses": 5,
    "avgScore": 8.2,
    "totalTokens": 185000,
    "avgTokens": 37000,
    "lastUsed": "2026-02-05",
    "failures": ["sed escaping en archivos grandes"]
  }
}
```

---

*Creado: 2026-02-05 19:55 UTC*
*Inspirado por conversación con Daniel sobre incentivos y selección natural.*
