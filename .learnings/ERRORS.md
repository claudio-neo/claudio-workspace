# Errors Log

Tracks unexpected failures, crashes, and operational issues for debugging and prevention.

**Format**: `[ERR-YYYYMMDD-XXX]` + structured markdown

**Review**: Before fixing bugs, revisiting features, or planning infra work

---

<!-- Entries append below -->

## [ERR-20260201-001] nightshift-report-stale-data

**Logged**: 2026-02-01T02:00:00Z
**Priority**: high
**Status**: resolved
**Area**: infra

### Summary
Nightshift report mostraba datos desactualizados (81.4% vs 89.6% real)

### Error
```
Bitcoin node: 81.4% synced (934,542 blocks)
Actual: 89.6% synced (954,786 blocks)
```

### Context
- Reporté estado de Bitcoin node sin verificar en tiempo real
- Usé datos de memoria o archivos antiguos
- Daniel me pilló: "Verificar y dar pruebas de los resultados"

### Root Cause
No ejecuté `bitcoin-cli getblockchaininfo` antes de reportar
Confié en datos cached o memoria

### Resolution
**REGLA GRABADA A FUEGO (2026-02-01):**
> "Verificar y dar pruebas de los resultados de órdenes directas, ya sean inmediatas o producto de una programación o proceso."

**Método:** SIEMPRE ejecutar comando antes de reportar estado

### Metadata
- Source: user_feedback
- Related Files: knowledge/nightshift-reports/*
- Tags: verification, bitcoin, reporting
- Promoted to: MEMORY.md → REGLAS CRÍTICAS

---
