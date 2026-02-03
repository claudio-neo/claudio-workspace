# OpenClaw v2026.2.1 — Auditoría de Cherry-Picks

**Upstream:** 219 commits adelante de claudio/sovereign
**Fecha auditoría:** 2026-02-03 00:20 UTC
**Versión actual:** v2026.1.30-sovereign

## PRIORIDAD ALTA — Cherry-pick recomendado

### 🔒 SSRF Guard Expansion (9bd64c8a1)
- Expande la cobertura SSRF en fetch-guard, audio providers, skills-install
- 14 archivos, 214 adiciones
- **Riesgo de no tener:** Posible SSRF via media providers o skills
- **Recomendación:** CHERRY-PICK

### 📡 Telegram long-poll timeout recovery (c6b4de520)
- Añade "timed out" a RECOVERABLE_MESSAGE_SNIPPETS
- grammY devuelve "timed out after X seconds" que no matcheaba "timeout"
- Causa: polling loop muere silenciosamente
- **Esto explica crashes/desconexiones que hemos experimentado**
- 2 archivos, 6 adiciones
- **Recomendación:** CHERRY-PICK URGENTE

### 📡 Telegram timeout recovery extended (561a10c49)
- PR #7466 — mejora sobre el anterior
- Solo actualiza CHANGELOG
- **Recomendación:** CHERRY-PICK junto con c6b4de520

### 📡 Grammy HttpError handling (99b4f2a24)
- Maneja HttpError de network failures en Grammy
- 3 archivos, 160+107 cambios (refactor grande del monitor.ts)
- **Recomendación:** CHERRY-PICK (pero verificar compatibilidad con nuestros cherry-picks anteriores de streaming)

### 🐛 Audio extraction fix (f49297e2c)
- Evita procesar archivos de audio como texto
- Previene errores de binary processing
- **Recomendación:** CHERRY-PICK

### 🐛 file_path alias validation (966228a6a)
- Fix de 1 línea en pi-tools.read.ts
- Asegura que el alias file_path pasa validación
- **Recomendación:** CHERRY-PICK (mínimo riesgo)

### 🐛 AbortSignal validation (5fb8f779c + 88e29c728)
- Valida instancias de AbortSignal antes de AbortSignal.any()
- Previene crashes por signals inválidos
- **Recomendación:** CHERRY-PICK

## PRIORIDAD MEDIA — Evaluar

### feat: default thinking for sessions_spawn (64849e81f)
- Permite configurar thinking por defecto para subagentes
- Útil para nuestros cron jobs con sessions_spawn
- **Recomendación:** EVALUAR — puede ser útil

### fix(webchat): scroll position (777756e1c + e18f43dda + más)
- Fix de scroll durante streaming en webchat
- No nos afecta directamente (usamos Telegram)
- **Recomendación:** SKIP

### feat: Discord thread parent binding (01d76e479)
- No usamos Discord
- **Recomendación:** SKIP

## PRIORIDAD BAJA — Skip

- iOS changes (múltiples commits) — no relevante
- Docs zh-CN changes — no relevante  
- Webchat UI changes — no relevante
- Docker e2e fixes — no relevante

## Resumen

**Cherry-picks recomendados:** 7-8 commits
**Riesgo principal:** El refactor de Grammy HttpError (99b4f2a24) toca monitor.ts que ya modificamos con cherry-picks de streaming. Puede haber conflictos.
**Plan:** Cherry-pick los pequeños primero (1 línea, 6 líneas), luego los más grandes con cuidado.

---

*Pendiente: aprobación de Daniel antes de ejecutar*
