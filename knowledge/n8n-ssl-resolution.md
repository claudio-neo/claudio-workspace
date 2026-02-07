# n8n SSL Certificate Resolution

**Date:** 2026-02-07  
**Problem:** ERR_SSL_PROTOCOL_ERROR preventing access to n8n.neofreight.net  
**Root Cause:** Caddy process died (SIGTERM received)

## Timeline

1. **Initial diagnosis:** DNS resolved ✅, HTTP redirect worked ✅, but HTTPS failed with TLS handshake error
2. **Discovery:** Caddy logs showed NO ACME activity for n8n.neofreight.net
3. **Root cause:** Caddy process PID 2652340 received SIGTERM and shutdown cleanly
4. **Certificate directory check:** No n8n.neofreight.net directory existed (never obtained cert)
5. **Resolution:** Restarted Caddy → ACME challenge completed automatically

## Solution

```bash
# Kill existing Caddy (if any)
pkill -f "caddy run"

# Restart Caddy
cd /home/neo
nohup /home/neo/caddy run --config /home/neo/Caddyfile > /tmp/caddy.log 2>&1 &
```

## Verification

```bash
# Check SSL certificate obtained
ls ~/.local/share/caddy/certificates/acme-v02.api.letsencrypt.org-directory/n8n.neofreight.net
# Output: Directory exists ✅

# Test HTTPS with basic auth
curl -I -u admin:calamardo2024 https://n8n.neofreight.net
# Output: HTTP/2 200 ✅
```

## ACME Challenge Details

Let's Encrypt verified via TLS-ALPN-01 challenge from multiple validation servers:
- 23.178.112.219 (US)
- 13.60.201.42 (EU)
- 18.119.111.5 (US)
- 35.90.64.222 (US)
- 13.214.201.74 (APAC)

Certificate issued successfully.

## Current Status

- **n8n:** Accessible at https://n8n.neofreight.net (basic auth: admin/calamardo2024)
- **LNbits:** Accessible at https://lnbits.neofreight.net (same auth)
- **Caddy PID:** 2833413
- **Logs:** /tmp/caddy.log

## Remaining Issue

**Caddy won't survive server reboot** (running via nohup, not process manager).

**Recommended fix:** Use PM2 to manage Caddy (no root required):

```bash
# Install PM2 (if not installed)
npm install -g pm2

# Create ecosystem.config.js for Caddy
pm2 start caddy --name caddy -- run --config /home/neo/Caddyfile

# Save PM2 config
pm2 save

# Enable PM2 startup (user-level, no root)
pm2 startup
# Follow instructions shown
```

**Why PM2 over systemd user service:**
- PM2 works without CAP_NET_BIND_SERVICE capability
- Can bind to ports <1024 because Caddy binary already has setcap
- Automatic restarts on crash
- User-level (no sudo required)
- Better logging and monitoring

## Key Learning

**Caddy's automatic HTTPS is excellent WHEN it's running.** The issue wasn't certificate acquisition difficulty—it was process management. Once Caddy restarted, certificates obtained in <3 seconds without any manual intervention.

**Process management matters more than configuration** for long-term reliability.
