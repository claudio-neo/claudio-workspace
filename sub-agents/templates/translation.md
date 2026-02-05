# Template: Translation (File → File)

**Tipo:** 🟢 ATÓMICA
**Score histórico:** 9/10 (1 uso, 37K tokens, 3m44s)
**Origen:** Sub-agente ad575f72 — traducción rusa Lightning bot

## ADN Ganador

```
The [LANGUAGE] locale file at `[TARGET_PATH]` needs to be [created/fixed].

Read the [SOURCE_LANGUAGE] source file at `[SOURCE_PATH]` which has ALL [N] keys with the original text.

Then write a COMPLETE `[TARGET_PATH]` with ALL [N] keys translated to proper [LANGUAGE].

RULES:
1. Keep the EXACT same keys (UPPER_SNAKE_CASE)
2. Keep all `{param}` placeholders EXACTLY as they are — do NOT translate parameter names
3. Keep all emoji exactly as they are
4. Keep Markdown formatting (*bold*, _italic_, `code`) exactly as they are
5. Keep all /command names in English (they're Telegram commands)
6. Translate EVERYTHING else to natural, correct [LANGUAGE]
7. Keep `\n` newlines in the same places
8. Output valid JSON (no trailing commas, properly escaped quotes)

Example:
[PROVIDE 2-3 EXAMPLES IN TARGET LANGUAGE]

After writing the file:
1. Validate JSON: `node -e "JSON.parse(require('fs').readFileSync('[TARGET_PATH]')); console.log('OK')"`
2. Check key count matches: `node -e "const src=JSON.parse(require('fs').readFileSync('[SOURCE_PATH]')); const tgt=JSON.parse(require('fs').readFileSync('[TARGET_PATH]')); console.log('SRC:', Object.keys(src).length, 'TGT:', Object.keys(tgt).length)"`
3. Commit: `cd [REPO_DIR] && git add [TARGET_PATH] && git commit -m "[COMMIT_MSG]"`
4. Restart service: `[RESTART_CMD]`
5. Verify: `[VERIFY_CMD]`
```

## Por Qué Funciona

- **Input → Output atómico:** lee un archivo, escribe otro
- **Sin escaping complejo:** JSON nuevo, no edición quirúrgica
- **Validación binaria:** JSON válido o no, N claves o no
- **Sin dependencias:** no necesita entender código alrededor
- **Commit + restart al final:** cierra el loop completamente

## Anti-Patterns (de fallos observados)

- ❌ NO pedir que "edite" un archivo de traducción existente — que lo REESCRIBA entero
- ❌ NO combinar traducción con code editing (son tareas distintas)
- ❌ NO dar tareas de >500 líneas sin ejemplos claros

## Variaciones Probadas

| Variación | Score | Notas |
|-----------|-------|-------|
| Ruso (311 keys, desde español) | 9/10 | Perfecto, 3m44s |

---

*Actualizado: 2026-02-05*
