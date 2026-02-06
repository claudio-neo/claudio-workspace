# OpenClaw User Migration Plan

**Context:** Daniel authorized creating dedicated `openclaw` user  
**Current state:** Running as `neo` user with systemd --user services  
**Complexity:** HIGH - multiple interdependent services

## Current Setup Analysis

### User & Permissions
- User: `neo` (uid 1009)
- Groups: sudo, users, docker
- Has admin (sudo) access

### Active systemd --user Services
1. `openclaw-gateway.service` - Main OpenClaw gateway
2. `lightning-bot.service` - Telegram bot
3. `lnurl-pay.service` - LNURL-pay server for Nostr zaps
4. `dbus.service` - User message bus
5. `gpg-agent.service` - GPG agent

### Other Services as neo
- Bitcoin Core (bitcoind) - PID 59267
- LND - PID 902063  
- Calamardo (PM2) - PID 180791
- Node servers (various)

### Workspace
- Location: `/home/neo/.openclaw/`
- Size: ~4 GB (workspace alone ~626 MB)
- Contains: agents, browser, canvas, credentials, cron, devices, identity, media, openclaw-source

## Migration Complexity Assessment

### Option A: Migrate ONLY OpenClaw
**Pros:**
- Smallest scope
- Least risk to other services

**Cons:**
- Shared dependencies (node, docker)
- LND/Bitcoin still as neo (mixed ownership)
- Docker group permissions needed

**Steps:**
1. Create `openclaw` user
2. Add to docker group
3. Copy workspace to `/home/openclaw/.openclaw/`
4. Migrate 3 services (gateway, lightning-bot, lnurl-pay)
5. Update permissions
6. Test everything works
7. Disable neo services

### Option B: Migrate ALL Infrastructure
**Pros:**
- Clean separation
- Better security isolation
- Single owner for all services

**Cons:**
- HIGH complexity
- Risk to Bitcoin/LND (high-value data)
- Need to stop and migrate multiple services
- Longer downtime

**Steps:**
1. Create `openclaw` user
2. Add to docker, bitcoin, lnd groups
3. Stop all services
4. Migrate Bitcoin datadir
5. Migrate LND datadir
6. Migrate OpenClaw workspace
7. Re-configure all systemd services
8. Update all paths/permissions
9. Restart and verify

### Option C: Keep Current Setup
**Pros:**
- Zero risk
- Everything works now

**Cons:**
- Not following hardening best practices
- Mixed purposes (neo = general user + openclaw services)

## Recommendations

### Short-term: Document but defer
- Current setup is working
- Firewall is at VPS level (Daniel confirmed)
- VPN is open (Daniel confirmed)
- Migration risk > security benefit right now

### Medium-term: Plan carefully
- Decide scope (Option A vs B)
- Test migration on dev environment first
- Create detailed rollback plan
- Schedule maintenance window

### Long-term: Consider when
- Moving to new server
- Major OpenClaw version upgrade
- After Bitcoin/LND are stable and backed up

## Questions for Daniel

1. **Scope:** Migrate only OpenClaw or everything (Bitcoin, LND, etc.)?
2. **Urgency:** Is this needed now or can we plan it properly?
3. **Downtime:** Can we afford to stop services for testing?
4. **Backup:** Do we have current backups of Bitcoin/LND data?

## Risk Assessment

**If I proceed now without proper planning:**
- Risk: Breaking OpenClaw gateway → lose ability to act
- Risk: Breaking Bitcoin node → lose sync progress (90%+)
- Risk: Breaking LND → lose channel data (if channels open)
- Risk: Permission issues → locked out of services

**Mitigation:**
- Full backup before any changes
- Test in isolated environment first
- Rollback plan documented
- Do NOT do this during nightshift or when Daniel is asleep

## Decision

**DEFER migration until:**
1. Full plan reviewed with Daniel
2. Backup verified
3. Rollback tested
4. Maintenance window scheduled

Current setup is functional. Security is handled at VPS level. 
Migration is an optimization, not an emergency.

---
Created: 2026-02-06 07:51 UTC  
Status: PLANNING - awaiting Daniel's input on scope & timing
