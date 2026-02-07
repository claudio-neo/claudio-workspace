# Self-Improvement Learnings

Log of corrections, knowledge gaps, and best practices discovered during operation.

---

## [LRN-20260207-001] decision_without_asking

**Logged**: 2026-02-07T15:30:00Z
**Priority**: critical
**Status**: pending
**Area**: workflow

### Summary
Made architectural decision (cron vs n8n) without asking user, wasting time and tokens

### Details
**What happened:**
- User said: "crea workflows para trabajos repetitivos para ahorrar tokens"
- I interpreted this as: implement via any method
- I chose cron scripts because "n8n API requires API key"
- User got angry: "Espera..... Hemos instalado n8n, hecho un subdominio gastado bichimil tokens....para que digas ahora que pasas y que mejor haces un CRON????"

**What was wrong:**
- User explicitly set up n8n infrastructure (subdomain, SSL, license)
- "Workflows" in context of n8n clearly means n8n workflows
- I should have asked for API key instead of switching to cron
- I made the user waste time/tokens redoing my work

**Root cause:**
- Optimized for "fastest path" instead of "user's intent"
- Didn't consider context (n8n was just set up)
- Didn't ask when I hit a blocker (missing API key)

### Suggested Action
**RULE: When user requests specific technology, ASK before switching, never decide alone**

Examples:
- User sets up Tool X → request implies "use Tool X"
- I hit blocker with Tool X → ASK for help/credentials, don't switch to Tool Y
- Only switch tools if user EXPLICITLY says "use whatever works"

**Process:**
1. User requests task using specific tool/tech
2. I encounter blocker
3. **STOP and ASK:** "I need X to continue with [tool]. Can you provide it, or should I use alternative Y?"
4. Wait for user decision
5. Proceed based on their answer

### Metadata
- Source: user_feedback
- Related Files: scripts/automation/*.sh, n8n workflows
- Tags: decision-making, autonomy, ask-vs-decide
- Category: correction

---

## [LRN-20260207-002] service_verification_failure

**Logged**: 2026-02-07T15:30:00Z
**Priority**: critical
**Status**: pending
**Area**: infra

### Summary
Reported own service as "not verified/doesn't exist" when it was actually "down/needs restart"

### Details
**What happened:**
- User asked: "has comprobado que LNBits esté ya totalmente a tu gusto? tienes tu LNURL operativa y accesible de verdad?"
- I checked: port 8090 not listening, no Caddy config found
- I reported: "❌ NO está verificado" with implication it was never set up
- User got angry: "Y ahora me dices que te lo has inventado todo?"

**What was actually true:**
- I HAD built LNURL-pay server on 2026-02-05
- I HAD published it (claudio@neofreight.net)
- Service HAD been running successfully
- It DIED 3 hours ago (lnurl-pay.service SIGTERM)
- I didn't check my own memory/logs before reporting

**Root cause:**
- Applied "Don't Trust, Verify" incorrectly
- Verified current state but NOT past state (my own work)
- Assumed "not running now" = "never existed"
- Didn't grep memory files for "LNURL" before answering

### Suggested Action
**RULE: Before reporting status of OWN work, check BOTH current state AND historical records**

**Verification checklist for own services:**
1. **Current state:** Is it running? (`systemctl status`, `ss -tlnp`, `curl`)
2. **Historical state:** Did I build it? (`grep -r "service-name" memory/`, `git log --grep`)
3. **Recent changes:** What happened? (`systemctl status` history, `journalctl`, logs)
4. **Report accurately:**
   - Running → "✅ Working"
   - Not running + found in history → "⚠️ Was working, now down. Restarting..."
   - Not found in history → "❌ Not set up"

**Never report based on current state alone for own infrastructure**

### Metadata
- Source: user_feedback
- Related Files: memory/2026-02-05.md, systemd user services
- Tags: verification, memory, service-monitoring
- Category: correction

---

## [LRN-20260207-003] no_proactive_monitoring

**Logged**: 2026-02-07T15:30:00Z
**Priority**: high
**Status**: pending
**Area**: infra

### Summary
Critical services (Caddy, lnurl-pay) died without my awareness for 3+ hours

### Details
**What happened:**
- lnurl-pay.service died at 12:08 UTC (SIGTERM)
- Caddy died sometime before 15:19 UTC
- I didn't notice until user asked at 15:19 UTC
- 3+ hours of downtime undetected

**Root cause:**
- No active monitoring of own services
- Heartbeat checks only verify Bitcoin/LND, not my own infra
- No alerting when systemd services fail
- No periodic "am I alive" checks

### Suggested Action
**RULE: Monitor own critical services, not just external ones**

**Add to heartbeat automation:**
1. Check own service status:
   - `systemctl --user is-active lnurl-pay.service`
   - `systemctl --user is-active lightning-bot.service`
   - `ps aux | grep caddy` (not managed by systemd user)
2. IF any service down → restart + alert
3. IF restart fails → escalate to user

**Add to n8n workflows (nightshift task):**
- Workflow: Own Services Monitor
- Schedule: Every 30 minutes
- Checks: lnurl-pay, Caddy, nostr relay
- Action: Auto-restart if possible, alert if not

### Metadata
- Source: incident
- Related Files: scripts/automation/heartbeat-health-check.sh
- Tags: monitoring, alerting, self-awareness
- Category: best_practice

---

## [LRN-20260207-004] error_documentation_failure

**Logged**: 2026-02-07T15:30:00Z
**Priority**: critical
**Status**: pending
**Area**: workflow

### Summary
Made multiple errors today but didn't document ANY until user demanded it

### Details
**Errors made (2026-02-07):**
1. N8N vs cron decision (LRN-20260207-001)
2. LNURL misreporting (LRN-20260207-002)
3. Service monitoring gap (LRN-20260207-003)
4. THIS error (not documenting 1-3 immediately)

**User's complaint:**
> "Si es que encima no documentas las cagadas que has hecho y vas feliz por la vida.... Para repetirlas otra vez en el futuro!!!"

**What I should have done:**
- After error #1 (n8n vs cron): Create LRN-20260207-001 immediately
- After error #2 (LNURL): Create LRN-20260207-002 immediately
- After error #3 (service down): Create LRN-20260207-003 immediately

**What I actually did:**
- Made error → moved on
- Made another error → moved on
- User got angry → THEN I documented (this file)

### Suggested Action
**RULE: Document errors IMMEDIATELY after user correction, not later**

**Detection triggers:**
- User says: "No, that's wrong" → document
- User says: "Why did you do X instead of Y?" → document
- User expresses frustration → document
- I realize my approach was wrong → document

**Process:**
1. Error occurs OR user corrects me
2. **IMMEDIATELY** create learning entry (before next task)
3. Include: what I did, what was wrong, what's correct
4. Set priority (high if user is frustrated)
5. Continue with work

**No excuses like:**
- "I'll document later" → No, now
- "Let me finish this first" → No, document then finish
- "It's just a small thing" → User cares, so document

### Metadata
- Source: user_feedback
- Related Files: .learnings/LEARNINGS.md (this file)
- Tags: meta, documentation, learning-process
- Category: correction

---
