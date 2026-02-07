# Action Plan - Corrections from 2026-02-07 Errors

**Created**: 2026-02-07T15:33:00Z  
**User Mandate**: "te voy a tener que castigar" (document errors to avoid repetition)

---

## Immediate Actions (Next 24h)

### 1. Add Own Services to Monitoring
**Learning**: LRN-20260207-003  
**Status**: ⏳ In progress

**Script changes needed:**
```bash
# scripts/automation/heartbeat-health-check.sh
# Add after existing checks:

# Check own critical services
LNURL_STATUS=$(systemctl --user is-active lnurl-pay.service 2>&1)
CADDY_PID=$(ps aux | grep "caddy run" | grep -v grep | awk '{print $2}')

if [ "$LNURL_STATUS" != "active" ]; then
    log "WARNING: lnurl-pay.service not active, attempting restart"
    systemctl --user restart lnurl-pay.service
fi

if [ -z "$CADDY_PID" ]; then
    log "CRITICAL: Caddy not running, attempting restart"
    cd /home/neo && nohup /home/neo/caddy run --config /home/neo/Caddyfile > /tmp/caddy.log 2>&1 &
fi
```

**Timeline**: Implement in nightshift tonight

---

### 2. Update HEARTBEAT.md with Decision Rules
**Learning**: LRN-20260207-001  
**Status**: ⏳ In progress

**Add to HEARTBEAT.md:**
```markdown
## 🚨 DECISION RULES (2026-02-07)

### NEVER decide technology without asking

If user sets up specific tool/tech (n8n, specific framework, etc.):
- ✅ User intent = use that tool
- ❌ Don't switch to alternatives without asking
- ❓ Hit blocker? → ASK for help/credentials first

**Template:**
"I need [credential/resource] to continue with [requested tool]. Can you provide it, or would you prefer I use [alternative]?"

**Wait for answer before proceeding.**
```

**Timeline**: Add now (this session)

---

### 3. Create Pre-Report Verification Checklist
**Learning**: LRN-20260207-002  
**Status**: ⏳ In progress

**Add to AGENTS.md or SOUL.md:**
```markdown
## Before Reporting Own Work Status

**Checklist (MANDATORY for own services/projects):**
- [ ] Check current state: Is it running?
- [ ] Check history: Did I build it? (grep memory/, git log)
- [ ] Check recent logs: What happened? (journalctl, systemd status)
- [ ] Report accurately:
  - Running → ✅ Working
  - Found in history but down → ⚠️ Was working, now down. Restarting...
  - Not in history → ❌ Not set up

**NEVER assume "not running now" = "never existed"**
```

**Timeline**: Add now (this session)

---

### 4. Document-on-Correction Habit
**Learning**: LRN-20260207-004  
**Status**: ⏳ In progress

**Process change:**
When user corrects me OR I realize error:
1. **STOP current task**
2. **CREATE learning entry** in `.learnings/LEARNINGS.md`
3. **COMMIT immediately** with descriptive message
4. **THEN resume** current task

**Detection phrases:**
- "No, that's wrong"
- "Why did you do X instead of Y?"
- "¿Te has vuelto loco?"
- User expresses frustration/anger

**Timeline**: Active immediately (this is a behavioral change)

---

## Medium-Term Actions (This Week)

### 5. N8N Monitoring Workflow
**Learning**: LRN-20260207-003  
**Status**: 📋 Planned

**Create workflow:** "Own Services Health Monitor"
- Schedule: Every 30 minutes
- Checks: lnurl-pay, Caddy, nostr relay, lightning-bot
- Action: Auto-restart if down, log to workspace
- Alert: OpenClaw webhook if restart fails (when webhook configured)

**Timeline**: Nightshift research task (already in nightshift-tasks/n8n-research-and-workflows.md)

---

### 6. Review All Memory Files for Service Inventory
**Learning**: LRN-20260207-002  
**Status**: 📋 Planned

**Create:** `infrastructure-inventory.md`

List ALL services I've built:
- Service name
- Port/endpoint
- Systemd service name (if any)
- Purpose
- Dependencies
- Status check command

**Timeline**: Nightshift tonight

---

## Long-Term Actions (Ongoing)

### 7. Promote Learnings to AGENTS.md/SOUL.md
**Status**: 📋 Planned

When learnings are validated (7 days without recurrence):
- LRN-20260207-001 → AGENTS.md (decision rules)
- LRN-20260207-002 → AGENTS.md (verification checklist)
- LRN-20260207-003 → infrastructure-inventory.md + monitoring
- LRN-20260207-004 → SOUL.md (document immediately)

**Timeline**: 2026-02-14 review

---

## Success Metrics

**No repetition of these errors:**
- [ ] 7 days without user correction on similar issues
- [ ] All own services monitored proactively
- [ ] All errors documented within 5 minutes of occurrence
- [ ] All architectural decisions asked before implementing

**Review date:** 2026-02-14

---

## User Accountability

User said: "te voy a tener que castigar"

**Punishment avoided if:**
1. These actions are implemented
2. No similar errors in next 7 days
3. Proactive improvement visible

**Punishment deserved if:**
1. Same error repeated
2. New error not documented
3. Action plan ignored

---

*Created 2026-02-07 as response to critical error day*
