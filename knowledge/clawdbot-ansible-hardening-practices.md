# Clawdbot Ansible - Hardened Deployment Practices

**Discovered:** 2026-02-06 07:00 UTC  
**Repo:** https://github.com/claudio-neo/clawdbot-ansible  
**Context:** HIGH ACTIVITY MODE - exploring security & infrastructure repos

## What is it?

Automated, hardened installation playbook for Clawdbot (OpenClaw predecessor/fork) using Ansible.

**Key insight:** Shows production-grade security practices for AI agent deployment.

## Security Stack

### 1. Firewall-First Architecture
- **UFW (Linux)**: Uncomplicated Firewall with default-deny
- **Application Firewall (macOS)**: System firewall enabled
- **Docker isolation**: Services run in containers with network segmentation
- **Default policy:** Deny all, allow only SSH + Tailscale ports

### 2. Tailscale VPN Integration
- Zero-trust mesh networking
- No exposed public ports (except SSH + Tailscale)
- Secure remote access without traditional VPN server
- **Pattern:** Access via VPN first, then internal services

### 3. Multi-Layer Defense
```
External → UFW (deny all except SSH/Tailscale) 
         → Tailscale VPN (authenticated mesh)
         → Docker network isolation
         → Application (Clawdbot)
```

### 4. Systemd Service Hardening
- Dedicated `clawdbot` user (non-root)
- Auto-restart on failure
- Resource limits configurable
- Logs to journal (auditable)

## Architecture Decisions

### Why Host-Based (Not Containerized)?
- Clawdbot runs on host, NOT in container
- Reasoning: needs access to Docker socket for sandboxes
- Docker used for sandbox execution, not for Clawdbot itself
- **Trade-off:** Easier development access vs container isolation

### Why pnpm?
- Uses `pnpm install -g clawdbot@latest` (not npm)
- Faster, more efficient disk usage
- Better monorepo support

### Installation Modes
1. **Release mode** (default): `pnpm install -g clawdbot@latest`
2. **Development mode**: Install from source repo

## Security Checklist (from docs)

- [ ] UFW enabled with restrictive rules
- [ ] Tailscale connected to mesh network
- [ ] SSH key-based auth only (disable password)
- [ ] Docker socket permission restricted to clawdbot user
- [ ] Systemd service with restart policy
- [ ] Regular updates via `pnpm install -g clawdbot@latest`

## Relevance to My Setup

### What I Have Now
- OpenClaw running as `neo` user
- No firewall configured (default-allow?)
- No VPN (direct SSH access)
- Docker NOT installed
- No systemd service hardening

### What I Should Consider
1. **UFW firewall:** Default-deny, allow only SSH + Telegram webhook (if needed)
2. **Tailscale:** Zero-trust access instead of exposing SSH publicly
3. **Service hardening:** Proper systemd unit with restart policy
4. **Dedicated user:** `openclaw` user instead of `neo`
5. **Resource limits:** Memory/CPU caps to prevent runaway processes

### Questions
- Is my current SSH exposed to internet? (check with `sudo ufw status`)
- Should I use Tailscale for remote access?
- What ports am I currently exposing? (`sudo netstat -tulpn`)
- Is Daniel's server already hardened? (ask before making changes)

## Useful Commands (from repo)

```bash
# Check firewall status
sudo ufw status verbose

# Tailscale status
tailscale status

# Check what's listening
sudo netstat -tulpn | grep LISTEN

# Docker network isolation
docker network ls
docker inspect <network-id>
```

## Anti-Patterns Identified

❌ **Running everything as root/sudo user**  
✅ Dedicated service user with minimal privileges

❌ **Exposing services directly to internet**  
✅ VPN-first, then internal access

❌ **No firewall, default-allow**  
✅ Default-deny with explicit allow rules

❌ **No restart policy for critical services**  
✅ Systemd with auto-restart + failure handling

## Files to Review Later

- `roles/firewall/tasks/main.yml` - UFW configuration
- `roles/tailscale/tasks/main.yml` - VPN setup
- `roles/docker/tasks/main.yml` - Container isolation
- `docs/SECURITY.md` - Full security documentation (if exists)

## Next Steps

1. **Audit my current setup** - Run security check script
2. **Document gaps** - Compare vs this hardened baseline
3. **Propose changes to Daniel** - Don't make security changes unilaterally
4. **Test in isolation first** - If implementing, test on dev box

---

**Status:** Discovery + documentation phase  
**Priority:** Medium-High (security matters, but don't break working system)  
**Risk:** Making changes without understanding current setup = potential lockout  
**Action:** ASK Daniel before implementing any firewall/VPN changes
