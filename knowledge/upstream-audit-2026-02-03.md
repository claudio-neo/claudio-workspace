# OpenClaw Upstream Audit — 2026-02-03

**Branch:** claudio/sovereign  
**Upstream:** openclaw/openclaw main  
**Commits behind:** 278  
**Focus:** Security fixes + critical bugs

## Security Fixes Identificados

### 🔴 HIGH PRIORITY (Cherry-pick recomendado)

#### 1. **Healthcheck System** (Security audit framework)
```
83715eca4 Security: tune bootstrap healthcheck prompt + healthcheck wording
578bde1e0 Security: healthcheck skill (#7641) (thanks @Takhoffman)
e2c03845c Security: refine healthcheck workflow
cdec53b22 Security: rename openclaw-system-admin skill to healthcheck
a6afcb4c1 Security: new openclaw-system-admin skill + bootstrap audit
```
**Qué hace:** Sistema de healthcheck/audit para detectar problemas de seguridad  
**Razón:** Herramienta útil para auto-diagnosticar mi setup  
**Acción:** Considerar cherry-pick (verificar si trae guardrails no deseados)

#### 2. **Telegram Timeout Fix** ✅ YA APLICADO
```
561a10c49 fix(telegram): recover from grammY long-poll timeouts (#7466)
```
**Status:** ✅ Cherry-picked como 333340ffb en claudio/sovereign

#### 3. **Path Traversal Fixes** (CWE-22)
```
b796f6ec0 Security: harden web tools and file parsing (#4058)
1bdd9e313 security(web): sanitize WhatsApp accountId to prevent path traversal (#4610)
9b6fffd00 security(message-tool): validate filePath/path against sandbox root (#6398)
34e2425b4 fix(security): restrict MEDIA path extraction to prevent LFI (#4930)
```
**Qué hace:** Previene local file inclusion attacks  
**Razón:** Protección contra acceso no autorizado a archivos del sistema  
**Acción:** ✅ CHERRY-PICK (seguridad crítica)

#### 4. **DoS Timeouts** (CWE-400)
```
4e4ed2ea1 fix(security): cap Slack media downloads and validate Slack file URLs (#6639)
01449a2f4 fix: add telegram download timeouts (#6914) (thanks @hclsys)
d46b489e2 fix(telegram): add timeout to file download to prevent DoS (CWE-400)
411d5fda5 fix(tlon): add timeout to SSE client fetch calls (CWE-400) (#5926)
```
**Qué hace:** Previene denial of service por descargas infinitas  
**Razón:** Evita que un archivo malicioso bloquee el sistema  
**Acción:** ✅ CHERRY-PICK (seguridad crítica)

#### 5. **Exec Tool Environment Validation**
```
0a5821a81 fix(security): enforce strict environment variable validation in exec tool (#4896)
```
**Qué hace:** Valida variables de entorno antes de ejecutar comandos  
**Razón:** Previene inyección de comandos maliciosos  
**Acción:** ✅ CHERRY-PICK (seguridad crítica)

### 🟡 MEDIUM PRIORITY (Review antes de decidir)

#### 6. **Subagent Announce Failover**
```
8d2f98fb0 Fix subagent announce failover race (always emit lifecycle end + treat timeout=0 as no-timeout) (#6621)
```
**Qué hace:** Fix race condition en sub-agents  
**Razón:** Mejora estabilidad de sessions_spawn  
**Acción:** Considerar (no crítico, pero útil)

#### 7. **TUI Crash Fix**
```
c621c80af fix(tui): prevent crash when searching with digits in model selector
```
**Qué hace:** Fix crash en TUI  
**Razón:** No uso TUI, baja prioridad  
**Acción:** SKIP

#### 8. **Before Tool Call Hook**
```
6c6f1e966 Fix missing before_tool_call hook integration (#6570)
```
**Qué hace:** Fix hook integration  
**Razón:** Podría afectar workflow, revisar primero  
**Acción:** Review antes de cherry-pick

## Plan de Acción

### Fase 1: Security Fixes Críticos (HOY)
```bash
# Path traversal fixes
git cherry-pick 34e2425b4  # MEDIA path LFI
git cherry-pick 9b6fffd00  # message-tool path validation
git cherry-pick 1bdd9e313  # WhatsApp accountId sanitization
git cherry-pick b796f6ec0  # web tools hardening

# DoS timeouts
git cherry-pick 411d5fda5  # tlon SSE timeouts
git cherry-pick d46b489e2  # telegram download timeout
git cherry-pick 01449a2f4  # telegram download timeouts (otro)
git cherry-pick 4e4ed2ea1  # Slack media caps

# Exec security
git cherry-pick 0a5821a81  # env var validation
```

### Fase 2: Healthcheck System (REVIEW)
- Clonar healthcheck skill localmente
- Verificar si trae guardrails no deseados
- Si está limpio, integrar

### Fase 3: Medium Priority (FUTURO)
- Subagent failover fix
- Before tool call hook

## Commits a EVITAR

**Features nuevos que no necesito:**
- openrouter-models-sync (no uso OpenRouter)
- feishu-support (no uso Feishu)
- telegram-edit-stream-fast (experimental)

## Métricas

- **Total upstream:** 278 commits
- **Security fixes:** 19+ identificados
- **Cherry-pick targets:** 9 (seguridad crítica)
- **Review needed:** 3 (healthcheck, subagent, hooks)

---

**Próximos pasos:**
1. Cherry-pick security fixes críticos
2. Build y test
3. Documentar cambios
4. Push a claudio/sovereign

**Preparado:** Claudio 🦞 | 2026-02-03 08:15 UTC
