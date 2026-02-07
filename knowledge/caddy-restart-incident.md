# Caddy Restart Incident — 2026-02-07 14:34 UTC

## Incident Summary

**Time:** 2026-02-07 14:34 UTC  
**Impact:** neofreight.net/n8n/ down (connection refused)  
**Root Cause:** Caddy process died (PID 2176518 disappeared)  
**Resolution:** Restarted Caddy manually with nohup

---

## Timeline

1. **14:34 UTC** — Daniel reports: `https://neofreight.net/n8n/ no funciona`
2. **14:34 UTC** — Verified: n8n running on localhost:5678 ✅
3. **14:34 UTC** — Discovered: Caddy process not running, port 443 closed
4. **14:34 UTC** — Restarted Caddy: `nohup /home/neo/caddy run --config /home/neo/Caddyfile &`
5. **14:35 UTC** — Verified: n8n and lnbits.neofreight.net working ✅

---

## Root Cause Analysis

### Why Caddy Died

Unknown. Process PID 2176518 disappeared without trace in journalctl.

**Possible causes:**
- OOM killer (unlikely, Caddy uses ~40MB RAM)
- Manual termination (no audit trail)
- Crash (no core dump found)
- Related to Caddy reload during lnbits config change

### Why It Didn't Auto-Restart

**No process manager configured.**

Caddy was running via manual command:
```bash
/home/neo/caddy run --config /home/neo/Caddyfile
```

**Attempted fix:** systemd user service  
**Result:** Failed with `bind: permission denied` on port 443

**Reason:** User neo lacks `CAP_NET_BIND_SERVICE` capability  
**Workaround:** Cannot run `sudo setcap` without password

---

## Current Solution

**Caddy running via nohup:**
```bash
cd /home/neo && nohup /home/neo/caddy run --config /home/neo/Caddyfile > /tmp/caddy.log 2>&1 &
```

**PID:** 2652340  
**Log:** `/tmp/caddy.log`

**Cons:**
- Won't survive reboot
- Won't auto-restart on crash
- No service management

---

## Recommended Long-Term Fix

### Option A: System Service (Requires Root)

1. Move `caddy.service` to `/etc/systemd/system/` (system-level)
2. Run as dedicated user with `CAP_NET_BIND_SERVICE`
3. Enable: `systemctl enable --now caddy`

**Pros:** Auto-restart, survives reboot, proper logging  
**Cons:** Requires root/sudo access to configure

### Option B: User Service + setcap (Requires Root)

1. Run: `sudo setcap cap_net_bind_service=+ep /home/neo/caddy`
2. Enable user service: `systemctl --user enable --now caddy`
3. Enable linger: `loginctl enable-linger neo`

**Pros:** No system-level changes, user control  
**Cons:** Requires one-time root for setcap

### Option C: PM2 (No Root)

1. Install PM2: `npm install -g pm2`
2. Start Caddy: `pm2 start /home/neo/caddy --name caddy -- run --config /home/neo/Caddyfile`
3. Save: `pm2 save && pm2 startup`

**Pros:** No root needed, process management, logs, monitoring  
**Cons:** Extra dependency (Node.js/PM2)

---

## Files Created

- `/home/neo/.config/systemd/user/caddy.service` (disabled, needs setcap)
- `/tmp/caddy.log` (current logs)

---

## Action Items

- [ ] Daniel: Decide on long-term fix (A/B/C)
- [ ] Implement chosen solution
- [ ] Document Caddy management in TOOLS.md
- [ ] Monitor Caddy stability over next 24h

---

**Status:** Incident resolved, temporary workaround active.
