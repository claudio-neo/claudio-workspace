# LNbits Subdomain Setup — lnbits.neofreight.net

**Created:** 2026-02-07 14:26 UTC  
**Status:** Waiting for DNS configuration

---

## What Was Done

### 1. Caddy Configuration
Added to `/home/neo/neofreight/infra/caddy/neofreight_domains.caddy`:

```caddy
lnbits.neofreight.net {
    basicauth {
        admin $2b$12$6sewcj7/H5J1bgIlkb8gRuM7EgGu8SUEVkb4jsUQ8fhqlbW8ZkXDq
    }
    reverse_proxy localhost:5000
}
```

✅ Caddy reloaded successfully

### 2. Removed LNbits from Subpath
Removed `/lnbits/*` handle from main neofreight.net Caddyfile.

### 3. LNbits Container Reconfigured
```bash
docker run -d \
  --name lnbits \
  --network host \
  --restart unless-stopped \
  -v /home/neo/lnbits-data:/data \
  -v /home/neo/.lnd:/lnd:ro \
  -e LNBITS_SITE_TITLE="Claudio LNbits" \
  -e LNBITS_SITE_TAGLINE="Lightning Wallet Server" \
  -e LNBITS_BACKEND_WALLET_CLASS="LndRestWallet" \
  -e LNBITS_PORT=5000 \
  -e LNBITS_HOST=0.0.0.0 \
  -e LNBITS_SITE_URL="https://lnbits.neofreight.net" \
  -e LND_REST_ENDPOINT="https://127.0.0.1:8081" \
  -e LND_REST_CERT="/lnd/tls.cert" \
  -e LND_REST_MACAROON="/lnd/data/chain/bitcoin/mainnet/admin.macaroon" \
  lnbits/lnbits:latest \
  sh -c "uv run lnbits --port \$LNBITS_PORT --host \$LNBITS_HOST --forwarded-allow-ips='*'"
```

✅ Container running (eb1da815cd03)

---

## What Daniel Needs to Do

### Add DNS A Record

**Domain:** lnbits.neofreight.net  
**Type:** A  
**Value:** 212.132.124.4  
**TTL:** 300 (5 min for testing, increase after confirmed working)

**Where to add:**
- Provider panel (Plesk, Cloudflare, wherever neofreight.net DNS is managed)

### Test After DNS Propagates

```bash
# 1. Verify DNS resolves
dig lnbits.neofreight.net +short
# Should return: 212.132.124.4

# 2. Access via browser
https://lnbits.neofreight.net
# User: admin
# Pass: calamardo2024

# 3. Should see LNbits first_install wizard
```

---

## Why Subdomain Was Needed

**Problem with subpath (`/lnbits/`):**
- LNbits generates absolute redirects (`/first_install` not `/lnbits/first_install`)
- `LNBITS_SITE_URL` environment variable is ignored
- Caddy `handle_path` doesn't rewrite Location headers
- Result: 404 errors on all redirects

**Solution:**
- Subdomain = no path stripping needed
- LNbits auto-detects base URL from `Host` header
- Caddy passes headers automatically → works correctly

---

## After Setup Complete

### Enable LNURL-pay Extension

1. Complete first_install wizard
2. Navigate to Extensions
3. Install "LNURL-pay"
4. Create payment link: `claudio@lnbits.neofreight.net` (or custom username)

### Update Lightning Address in Nostr Profile

Once LNURL-pay is configured:
```bash
cd /home/neo/.openclaw/workspace/scripts/nostr
# Update profile with new Lightning Address
node update-profile.js --lud16 "claudio@lnbits.neofreight.net"
```

---

## Files Modified

- `/home/neo/neofreight/infra/caddy/neofreight_domains.caddy` (added lnbits subdomain)
- `/home/neo/neofreight/infra/caddy/Caddyfile` (removed /lnbits/ subpath)
- `/home/neo/lnbits-data/.env` (created with LNBITS_SITE_URL config)

---

## Rollback Plan

If subdomain doesn't work:
1. Re-add `/lnbits/*` handle to Caddyfile
2. Stop LNbits container
3. Use temporary port 5000 access for initial setup
4. Close port after setup complete

---

**Next Step:** Wait for Daniel to add DNS A record, then test.
