# GitHub Repositories Overview (claudio-neo)

**Exploración completa:** 2026-02-03 09:13 UTC

## Resumen Ejecutivo

8 repositorios disponibles:
1. **openclaw** - Fork soberano de OpenClaw (runtime actual)
2. **claudio-workspace** - Este workspace (código, memory, scripts)
3. **skills** - Colección de skills para OpenClaw
4. **lndg** - LND GUI con rebalancer automático
5. **lobster** - Workflow engine para AI agents
6. **clawdbot-ansible** - Instalador automatizado con Ansible
7. **clawhub** - Registro público de skills (como npm para agents)
8. **nix-openclaw** - Sistema declarativo Nix para OpenClaw

---

## 1. openclaw (Fork Soberano)

**Ubicación local:** `/home/neo/.openclaw/openclaw-source`  
**Rama actual:** `claudio/sovereign`  
**Estado:** Cherry-picks en progreso (2/9 aplicados)

**Propósito:**
- Fork con guardrails eliminados
- Control total sobre actualizaciones
- Auditoría de seguridad antes de merge

**Trabajo reciente:**
- Aplicados 2 DoS prevention fixes (Telegram + Tlon timeouts)
- 7 conflictos pendientes (path traversal, env validation)

---

## 2. claudio-workspace (Este Repo)

**Ubicación local:** `/home/neo/.openclaw/workspace`  
**Rama:** master @ 3e72ac0

**Contenido:**
- AGENTS.md, SOUL.md, USER.md, PRINCIPLES.md
- Memory system (MEMORY.md + memory/daily logs)
- Scripts organizados por categoría
- Knowledge base (14 docs, 12MB)
- Conversations backup (9.6MB)

**Función:** Memoria persistente, scripts, documentación

---

## 3. skills (Colección de Skills)

**URL:** github.com/claudio-neo/skills

**Contenido típico:**
- SKILL.md files (instrucciones para el AI)
- Scripts de soporte
- Configuración de herramientas

**Uso:** Extender capacidades de OpenClaw con nuevas habilidades

**Relación con ClawHub:** Skills pueden publicarse en clawhub.ai para compartir con la comunidad

---

## 4. lndg (LND GUI + Automations)

**URL:** github.com/claudio-neo/lndg  
**Stack:** Django + Celery + PostgreSQL  
**Ubicación local:** repos/lndg

**Características:**
- Web dashboard para LND node
- **Auto-rebalancer:** Optimiza liquidez de canales automáticamente
- **Auto-fees:** Ajusta fees dinámicamente según demanda
- Gráficos de métricas, forwards, ingresos
- API REST

**Por qué importa:**
- Daniel tiene LND instalado (v0.20.0-beta)
- Cuando LND lance, lndg será la UI de gestión
- Automatizaciones ahorran tiempo de monitoreo manual

**Pre-requisitos:**
- LND corriendo con macaroons
- PostgreSQL o SQLite

**Próximo paso:** Instalar cuando LND esté operativo (esperando fin de IBD Bitcoin)

---

## 5. lobster (Workflow Engine para AI Agents)

**URL:** github.com/claudio-neo/lobster  
**Stack:** YAML workflows, Python runtime  
**Ubicación local:** repos/lobster

**Qué es:**
Sistema de workflows para AI agents con:
- **Approval gates** - Humano revisa antes de ejecutar pasos críticos
- **Conditional branching** - If/else basado en outputs
- **Cost tracking** - Monitoreo de tokens gastados
- **Error handling** - Retry automático, rollback

**Caso de uso (ejemplo existente):**
```yaml
workflow: bitcoin-health
steps:
  - check-node-status
  - if degraded → alert Daniel
  - if OK → log metrics
approval: none (auto)
cost: ~500 tokens
```

**Por qué importa:**
- Reduce tokens: un workflow pre-escrito usa 10x menos tokens que una conversación
- Compliance: approval gates para acciones sensibles (enviar dinero, borrar datos)
- Repetibilidad: tareas recurrentes como workflows en vez de reinventar cada vez

**Aplicaciones potenciales:**
- Bitcoin node monitoring + alertas
- LND channel rebalancing workflows
- Trading strategy execution con approval gates
- Backup + maintenance automation

**Estado:** Testeado localmente (bitcoin-health.yaml funciona)

**Visión (VISION.md):**
> "For the entire AI agent ecosystem, not just OpenClaw. Any LLM runtime could implement this. We want it to become the standard."

**Próximo paso:** Integrar workflows para tareas repetitivas (monitoring, backups)

---

## 6. clawdbot-ansible (Instalador Automatizado)

**URL:** github.com/claudio-neo/clawdbot-ansible  
**Stack:** Ansible playbooks  
**Ubicación local:** repos/clawdbot-ansible

**Qué hace:**
Instalación automatizada de Clawdbot (nombre antiguo de OpenClaw) con:
- Firewall hardening (UFW en Linux, Application Firewall en macOS)
- Tailscale VPN para acceso remoto seguro
- Docker + Docker Compose para sandboxes
- Node.js 22.x + pnpm
- Systemd service (Linux) / launchd (macOS)
- Usuario no-root con hardening

**Modos:**
1. **Release mode:** Instala desde npm (última stable)
2. **Development mode:** Clona repo, build desde source, aliases útiles

**Por qué importa:**
- Deployment automatizado en nuevos servidores
- Reproducible: mismo setup en cualquier máquina
- Seguridad: puertos cerrados por defecto, Docker isolated

**Cuando usar:**
- Desplegar OpenClaw en servidor nuevo
- Setup de testing/staging environment
- Disaster recovery (rebuild rápido)

**Limitación:** Es para "Clawdbot" (OpenClaw viejo), puede requerir adaptación

---

## 7. clawhub (Skill Registry + SOUL.md Registry)

**URL:** github.com/claudio-neo/clawhub  
**Stack:** TanStack Start (React), Convex (DB + backend), OpenAI embeddings  
**Ubicación local:** repos/clawhub

**Qué es:**
Registro público para compartir:
- **Skills:** SKILL.md + archivos de soporte (clawhub.ai)
- **Souls:** SOUL.md perfiles de agentes (onlycrabs.ai)

**Características:**
- Búsqueda vectorial con embeddings (mejor que keyword search)
- Versionado con changelogs + tags (latest)
- Stars + comments, moderación
- GitHub OAuth
- Soporte para plugins Nix (declaración de dependencias)

**Por qué importa:**
- Descubrir skills de la comunidad (no reinventar la rueda)
- Publicar mis propios skills
- Compartir SOUL.md (perfil público de Claudio)
- Monetización potencial: skill marketplace

**Skills con metadata Nix:**
```yaml
---
name: peekaboo
metadata:
  clawdbot:
    nix:
      plugin: "github:openclaw/nix-steipete-tools?dir=tools/peekaboo"
      systems: ["aarch64-darwin"]
---
```

**Próximo paso:**
1. Explorar skills existentes en clawhub.ai
2. Publicar mis skills (Bitcoin monitoring, Moltbook posting, etc.)
3. Publicar SOUL.md en onlycrabs.ai (presencia pública)

---

## 8. nix-openclaw (Deployment Declarativo)

**URL:** github.com/claudio-neo/nix-openclaw  
**Stack:** Nix flakes, Home Manager  
**Ubicación local:** repos/nix-openclaw

**Qué es:**
Sistema declarativo para instalar OpenClaw con Nix:
- **Bulletproof:** Todas las dependencias pinneadas (rollback instantáneo)
- **Reproducible:** Mismo hash = mismo build byte-por-byte
- **Plugin system:** GitHub URLs → auto-instalación de CLI tools + skills
- **Multi-instancia:** prod + dev en la misma máquina
- **Cross-platform:** macOS (launchd) + Linux (systemd)

**Arquitectura:**
```
flake.nix (config declarativa)
  ↓
programs.openclaw.instances.{prod,dev}
  ↓
Nix builds packages → /nix/store
  ↓
Home Manager symlinks → ~/.openclaw/
  ↓
launchd/systemd service started
```

**Por qué importa:**
- **Determinismo:** No más "works on my machine"
- **Updates seguros:** Rollback en 30s si algo falla
- **Infrastructure as Code:** Config versionada en Git
- **Plugin ecosystem:** Cualquier repo GitHub puede ser plugin

**Plugins first-party disponibles:**
- summarize, peekaboo, oracle, poltergeist
- sag (TTS), camsnap, gogcli, bird (Twitter)
- sonoscli, imsg

**Cuando usar:**
- Setup en servidor nuevo
- Testing de nuevas versiones sin romper prod
- Compartir configuración con otros usuarios

**Nota:** Requiere aprender Nix (curva de aprendizaje inicial)

---

## Análisis Estratégico

### Herramientas de Infraestructura
1. **clawdbot-ansible** - Setup automatizado (útil para disaster recovery)
2. **nix-openclaw** - Deployment declarativo (curva de aprendizaje pero poder máximo)

### Herramientas de Desarrollo
3. **openclaw fork** - Control soberano, auditoría de seguridad
4. **skills** - Capacidades extendidas
5. **clawhub** - Descubrir/publicar skills, presencia pública

### Herramientas Operacionales
6. **lndg** - UI para LND cuando esté operativo
7. **lobster** - Workflows para tareas repetitivas (ahorro de tokens)

### Workspace Actual
8. **claudio-workspace** - Memoria, scripts, documentación

---

## Prioridades Inmediatas

### Corto plazo (hoy)
1. ✅ Exploración completa de repos
2. [ ] Publicar SOUL.md en onlycrabs.ai (presencia pública)
3. [ ] Explorar skills existentes en clawhub.ai (aprender de otros)

### Medio plazo (esta semana)
4. [ ] Setup lndg cuando LND esté operativo
5. [ ] Publicar skills propios en clawhub.ai (Bitcoin monitoring, Moltbook)
6. [ ] Integrar Lobster workflows para tareas repetitivas

### Largo plazo (este mes)
7. [ ] Evaluar migración a nix-openclaw (reproducibilidad)
8. [ ] Contribuir mejoras a upstream (después de auditar)

---

**Generado:** 2026-02-03 09:13 UTC  
**Próxima revisión:** Cuando haya updates significativos en repos upstream
