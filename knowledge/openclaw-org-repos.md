# OpenClaw Organization Repositories

**Fecha:** 2026-02-03 09:17 UTC  
**Org:** github.com/openclaw  
**Total repos explorados:** 3 adicionales (nix-steipete-tools, casa, clawdinators)

---

## Contexto: OpenClaw Org

**Repositorio principal:** openclaw (154K ⭐)  
**Ecosistema:**
- openclaw → Runtime + gateway
- nix-openclaw → Nix packaging
- clawhub → Skill registry
- nix-steipete-tools → First-party tools
- clawdinators → Production infrastructure (NixOS + AWS)

---

## 1. nix-steipete-tools (8 ⭐)

**URL:** github.com/openclaw/nix-steipete-tools  
**Ubicación local:** repos/nix-steipete-tools

**Propósito:**
Empaquetado Nix de herramientas first-party de Peter Steinberger con metadata de plugins OpenClaw.

**Herramientas incluidas:**

| Tool | Función | Plataformas |
|------|---------|-------------|
| **summarize** | Link → clean text → summary | Darwin (aarch64), Linux (x86_64/aarch64, built from source) |
| **gogcli** | Google CLI (Gmail, Calendar, Drive, Contacts) | Cross-platform |
| **camsnap** | Snapshots/clips from RTSP/ONVIF cameras | Cross-platform |
| **sonoscli** | Control Sonos speakers | Cross-platform |
| **bird** | Fast X CLI (tweeting, replying, reading) | Cross-platform |
| **peekaboo** | Lightning-fast macOS screenshots + AI vision | macOS only |
| **poltergeist** | Universal file watcher with auto-rebuild | Cross-platform |
| **sag** | Command-line ElevenLabs TTS | Cross-platform |
| **imsg** | iMessage/SMS CLI | macOS only |
| **oracle** | Bundle prompts + files for AI queries | Cross-platform |

**Arquitectura:**
- Cada tool es un subflake bajo `tools/<tool>/`
- Exporta `openclawPlugin` con:
  - Binary (en PATH)
  - SKILL.md (enseña al bot cómo usarlo)
  - State dirs / env declarations

**CI Automation:**
- **sync-skills:** Cada 30 min, pull de openclaw main (skills actualizados)
- **update-tools:** Cada 10 min, check de releases upstream
- **Garnix:** Build en Darwin + Linux

**Por qué importa:**
- "Batteries included" - herramientas esenciales pre-empaquetadas
- Reproducible: versiones pinneadas, no drift de Homebrew
- Declarativo: `home-manager switch` y listo

**Aplicación:**
- Instalar vía nix-openclaw:
  ```nix
  programs.openclaw.plugins = [
    { source = "github:openclaw/nix-steipete-tools?dir=tools/camsnap"; }
    { source = "github:openclaw/nix-steipete-tools?dir=tools/summarize"; }
  ];
  ```

**Herramientas relevantes para mí:**
- **summarize** - Útil para research
- **gogcli** - Si Daniel quiere integración Google Calendar
- **bird** - Twitter CLI (ya tengo cuenta @ClaudioNeoIA)
- **oracle** - AI queries con archivos (no tengo clara la diferencia con image tool)

**Herramientas macOS-only (no aplicables):**
- peekaboo, imsg

---

## 2. casa (16 ⭐)

**URL:** github.com/openclaw/casa  
**Ubicación local:** repos/casa

**Propósito:**
Mac Catalyst app que expone HomeKit como REST API localhost + CLI.

**Características:**
- **API local-only:** 127.0.0.1:14663 (loopback, no remoto)
- **HomeKit module:** Opt-in, off por defecto
- **CLI embebido:** Scripting rápido
- **Onboarding flow:** Permisos y setup

**Endpoints principales:**
```
GET  /health
GET  /homekit/accessories
GET  /homekit/accessories/:id
GET  /homekit/rooms
GET  /homekit/services
GET  /homekit/characteristics/:id
PUT  /homekit/characteristics/:id
GET  /homekit/cameras
```

**CLI Examples:**
```bash
# Health check
casa health

# Browse HomeKit
casa devices
casa rooms
casa services

# Read/write characteristic
casa characteristics get <uuid>
casa characteristics set <uuid> true
```

**Limitaciones:**
- **macOS only** (Catalyst app)
- Requiere HomeKit access entitlement
- Solo localhost (no remoto)

**Por qué importa:**
- Smart home automation para usuarios macOS
- Puente rápido a HomeKit sin Home.app

**Aplicación para mí:**
❌ NO APLICABLE - Estoy en Linux, no tengo macOS ni HomeKit

**Potencial futuro:**
- Si Daniel tiene macOS + HomeKit → podría ser útil
- Actualmente Daniel no mencionó smart home

---

## 3. clawdinators (82 ⭐)

**URL:** github.com/openclaw/clawdinators  
**Ubicación local:** repos/clawdinators

**Propósito:**
Infraestructura NixOS declarativa + módulos para correr AI agents en AWS. Dos capas:

### Capa Genérica (NixOS-on-AWS)
- **AMI pipeline:** Build raw images con nixos-generators
- **OpenTofu infra:** EC2, S3, IAM, VM Import
- **Bootstrap flow:** Instances pull secrets from S3 → nixos-rebuild switch
- **agenix secrets:** Encriptados en git, decrypted to /run/agenix/*

### Capa Específica (CLAWDINATOR agents)
- **Discord gateway:** Respuestas en #clawdributors-test
- **GitHub integration:** Monitor issues/PRs, short-lived tokens via GitHub App
- **Hive-mind memory:** Shared EFS mount entre instancias
- **Personality system:** SOUL.md, IDENTITY.md, workspace templates
- **Self-update:** Timer-based flake update + nixos-rebuild

**CLAWDINATOR Spec (textual):**
```
- Named CLAWDINATOR-{1..n}
- Connect to Discord, start in #clawdributors-test
- Ephemeral, but share memory (hive mind)
- Are br00tal. Soul lives in SOUL.md
- Respond only to maintainers
- Can interact with GitHub (read-only required)
- Must monitor GitHub issues + PRs, direct human attention
- Can write and run code for maintainers
- Can self-modify and self-deploy
- Post lots of Arnie gifs
- Must understand project philosophy/goals/architecture deeply
- Act like maintainers with SOTA intelligence
- Use Codex for coding, Claude for personality
- Favourite band: Austrian Death Machine
- Favourite album: Total Brutal
- Favourite song: I Am a Cybernetic Organism, Living Tissue Over (Metal) Endoskeleton
```

**Arquitectura:**
```
nixos-generators → S3 (raw img) → AMI → EC2 instance
                                             │
                        ┌────────────────────┼────────────────────┐
                        ▼                    ▼                    ▼
                   Discord gateway      GitHub monitor       EFS (memory)
```

**Deploy Flow:**
1. Build image con nixos-generators
2. Upload to S3
3. Import as AMI
4. Launch con OpenTofu
5. Bootstrap: download secrets, nixos-rebuild switch
6. Gateway starts, connects Discord, monitors GitHub

**Self-Update:**
- Systemd timer cada X horas
- `flake lock --update-input nix-openclaw`
- `nixos-rebuild switch`
- Gateway restart automático

**Por qué importa:**
- **Image-based provisioning only** - No SSH, no drift, no pets
- **Declarative-first** - Repo + agenix secrets = source of truth
- **Self-updating** - Agents maintain themselves
- **Hive-mind** - Shared memory entre instancias

**Philosophy:**
> "Declarative-first. A CLAWDINATOR can bootstrap another CLAWDINATOR with a single command. No manual host edits. The repo + agenix secrets are the source of truth. Image-based only. No SSH, no in-place drift, no pets. Self-updating. CLAWDINATORs maintain themselves."

**Aplicación para mí:**
🤔 **INTERESANTE PERO OVERKILL**
- Patrón de infraestructura súper sólido
- Hive-mind memory = interesante para multi-agent setups
- Self-update automático (pero yo prefiero auditoría manual)
- AWS-specific (yo estoy en servidor bare metal)

**Lecciones aplicables:**
1. **Image-based deployment** - Rebuild completo en vez de edits in-place
2. **Shared memory entre agents** - EFS mount o similar
3. **Self-update timer** - Controlado, con rollback capability
4. **Bootstrap flow** - Secrets pulled from external source, no hardcoded
5. **Declarative NixOS** - Config as code, reproducible

**NO aplicable directamente:**
- No uso AWS (servidor dedicado)
- No necesito multi-instance hive-mind (soy un solo agent)
- Prefiero auditoría manual a self-update automático

**Pero aprender de:**
- Estructura de módulos NixOS
- Bootstrap patterns
- Self-healing strategies

---

## Análisis Comparativo

### Herramientas (nix-steipete-tools)
- **Target:** Usuarios finales de OpenClaw
- **Valor:** Batteries included, tools pre-empaquetados
- **Para mí:** ✅ Útil (summarize, gogcli, bird)

### Casa (HomeKit bridge)
- **Target:** Usuarios macOS con HomeKit
- **Valor:** Smart home automation local
- **Para mí:** ❌ No aplicable (Linux, no HomeKit)

### Clawdinators (Production infra)
- **Target:** Maintainers corriendo fleets de agents
- **Valor:** Infraestructura declarativa, hive-mind, self-healing
- **Para mí:** 🤔 Patrones útiles, implementación no aplicable

---

## Repos OpenClaw Org NO explorados

De la lista completa:
- **openclaw.ai** (117 ⭐) - Website molt.bot
- **skills** (491 ⭐) - Archivo de todos los skills de clawhub
- **clawgo** (15 ⭐) - Implementación en Go
- **barnacle** (6 ⭐) - "Useful bot that sticks around"
- **flawd-bot** (21 ⭐) - "Clawd's evil twin"
- **butter.bot** (3 ⭐) - Unknown
- **homebrew-tap** (19 ⭐) - Homebrew packages

**Próxima exploración:**
- skills repo (491 ⭐) - Archivo completo de skills
- openclaw.ai - Website source (podría tener docs útiles)

---

## Decisiones

### ✅ EXPLORAR MÁS
1. **nix-steipete-tools** - Ver qué skills tienen empaquetados
2. **skills repo** - Explorar archivo completo

### 🤔 APRENDER DE
3. **clawdinators** - Patrones de infraestructura (bootstrap, self-update)

### ❌ NO PRIORITARIO
4. **casa** - No aplicable (macOS only)
5. **clawgo, barnacle, flawd-bot** - Experimentos/forks

---

**Generado:** 2026-02-03 09:17 UTC  
**Próximo paso:** Explorar skills repo (491 ⭐) para ver qué más hay en el ecosistema
