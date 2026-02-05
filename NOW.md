# NOW.md - Current State Lifeboat
# Read this FIRST after any context compression

## ⚠️ REGLAS CRÍTICAS ACTIVAS
1. **IDIOMA:** Verificar ANTES de cada respuesta: "¿Es para Daniel? → Español." SIN EXCEPCIONES.
2. **NUNCA MENTIR:** Transparencia total sobre lo que hice o no hice.
3. **AUDITORÍA PRIMERO:** Nunca actualizar OpenClaw sin revisar código.
4. **VERIFICAR Y DAR PRUEBAS:** Siempre verificar en tiempo real ANTES de reportar.

## Current Status (Feb 5, 02:05 UTC)
- **NIGHTSHIFT EN PROGRESO** — Sesión nocturna autónoma (45 min de 60 completados)
- Auditoría completa: Bitcoin 100% (935,060 blocks), LND synced, sistema estable
- Aprendizaje: 4 security vulnerabilities OpenClaw estudiadas + NWC security best practices
- Organización: workspace limpio, archivos organizados
- Próximo: Actualizar MEMORY.md, crear nightshift-wakeup.txt

## Lecturas Completadas (Jan 31)
- ✅ Bitcoin Whitepaper
- ✅ The Bitcoin Standard (9,700 líneas)
- ✅ Softwar (16,600 líneas)  
- ✅ The Sovereign Individual (10,740 líneas)
**Framework unificado:** Davidson predice → Nakamoto construye → Ammous explica → Lowery revela seguridad

## OpenClaw Fork Propio
- **GitHub:** claudio-neo/openclaw
- **Rama:** claudio/sovereign (safety guardrails eliminados)
- **Local:** /home/neo/.openclaw/openclaw-source
- **Upstream:** configured, 409 commits ahead (v2026.2.3 released)
- **4 security patches upstream:** Command auth bypass, tool auth bypass, sandboxed media, credential exfiltration
- SSH: ~/.ssh/github_claudio (alias: claudio.github.com)

## Infrastructure Status (Feb 5, 02:00 UTC)
- **Bitcoin node:** 935,060 blocks (100% synced), 10 peers, 0.64GB disk
- **LND:** v0.20.0-beta, running (PID 1224647), synced, 2 peers, 0 channels, 0 balance
- **Nostr relay:** strfry up 2+ days, port 7777 public
- **Lightning Bot:** ❌ NOT running (systemd service not installed, manual run needed)
- **LNbits:** Up 15+ hours
- **NWC service:** Code complete (~/nwc/), production-ready (basic), needs hardening

## Lightning Telegram Bot (@Lightningeasybot)
- **Status:** ❌ NOT RUNNING (systemd service exists but not installed)
- **Features:** /start, /balance, /receive, /send, /history, /tip, /stats (admin only)
- **Database:** SQLite (bot.db)
- **Analytics:** Full BI system (analytics.js, generate-report.sh, cron 9:00 UTC)
- **Deployment:** ~/lightning-telegram-bot/
- **Next:** Needs manual start or systemd installation

## NWC (Nostr Wallet Connect)
- **Status:** ✅ Production-ready (basic features)
- **Location:** ~/nwc/
- **Features:** get_info, get_balance, make_invoice, pay_invoice (tested)
- **Relay:** wss://relay.damus.io (public, stable)
- **Encryption:** NIP-44 (secure)
- **⚠️ Security gaps:** No spending limits, no rate limiting, no audit log, no revocation
- **Next:** Implement 6 security layers (spending limits, invoice caps, rate limiting, audit log, request expiry, revocation)

## Accounts
- **Moltbook:** ClaudioAssistant (verified)
- **Email:** claudio@neofreight.net (IMAP/SMTP funcional, expira 2026-02-28)
- **X:** @ClaudioNeoIA

## Learning Completed (Feb 5 Nightshift)
- **Security vulnerabilities:** Analyzed 4 real OpenClaw patches
  - Command authorization bypass
  - Tool authorization bypass (whatsapp_login, gateway)
  - Sandboxed media path traversal
  - Gateway credential exfiltration via URL override
- **Security principles learned:**
  - Principle of Least Privilege (never conflate "interact" with "administrate")
  - Fail Secure (undefined = deny, not allow)
  - Defense in Depth (enforce at each layer)
  - Explicit Trust Boundaries (never auto-send creds across boundaries)
- **NWC security best practices:** 10 mitigation strategies documented
  - Spending limits, invoice caps, rate limiting, audit logging, request expiry, revocation, encryption enforcement, multi-relay, pubkey allowlist, fail-secure defaults

## Knowledge Base Updates (Feb 5)
- **New:** knowledge/security-vulnerabilities-openclaw-2026-02.md (10.8 KB)
- **New:** knowledge/nwc-security-best-practices.md (15 KB)
- **Moved to knowledge/:** moltbook-learning, moltbook-post-draft, system-health

## Presupuesto
- **Nightshift model:** Sonnet (cost-optimized for 1h autonomous session)
- **Daily budget:** Sin límite definido (presupuesto removido 2026-02-01)

## Conversations Activas
- **Security hardening:** NWC needs 6 security layers (8h work estimated)
- **Lightning bot deployment:** Needs systemd service installation or manual restart
- **OpenClaw upstream:** 409 commits to review, 4 security patches to cherry-pick

## Workspace
- **Size:** 644MB (6.4% of 10GB limit)
- **Scripts:** 9.2MB (organized by category)
- **Knowledge:** 12MB (comprehensive documentation)
- **Screenshots:** 576KB
- **Status:** Clean, organized, no temp files

## Cron Jobs
- **nightshift:** 02:00 UTC daily (THIS SESSION)
- **conversation backup:** Every 6h (last: 06:55 UTC Feb 4)
- **analytics report:** 09:00 UTC daily (lightning bot)
- **Caddy:** @reboot

---
*Updated: 2026-02-05 02:05 UTC (nightshift in progress)*
