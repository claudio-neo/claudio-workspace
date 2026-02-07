# n8n Subdomain Setup — n8n.neofreight.net

**Created:** 2026-02-07 14:38 UTC  
**Status:** Waiting for DNS configuration

---

## Problem

n8n running under `/n8n/*` subpath had 404 errors on all assets:
- `/assets/index-BohJmWc7.js` → 404
- `/static/base-path.js` → 404
- All Vue/JavaScript bundles → 404

**Root Cause:** n8n generates absolute paths (`/assets/*`) not subpath-aware (`/n8n/assets/*`)

---

## Solution

**Moved n8n to subdomain:** `n8n.neofreight.net`

Same approach as LNbits - SPAs work better on subdomains than subpaths.

---

## What Was Done

### 1. Caddy Configuration

**Added to `/home/neo/neofreight/infra/caddy/neofreight_domains.caddy`:**
```caddy
n8n.neofreight.net {
    basicauth {
        admin $2b$12$6sewcj7/H5J1bgIlkb8gRuM7EgGu8SUEVkb4jsUQ8fhqlbW8ZkXDq
    }
    reverse_proxy localhost:5678
}
```

**Removed from `/home/neo/calamardo/infra/caddy/calamardo_routes.caddy`:**
```caddy
# Old: handle_path /n8n/* (removed)
# n8n moved to subdomain n8n.neofreight.net (2026-02-07)
```

### 2. Caddy Reloaded

```bash
/home/neo/caddy reload --config /home/neo/Caddyfile
```

✅ Config validated and reloaded

---

## What Daniel Needs to Do

### Add DNS A Record

**Domain:** `n8n.neofreight.net`  
**Type:** A  
**Value:** `212.132.124.4`  
**TTL:** 300 (5 min for testing)

**Where:** Same DNS panel as neofreight.net

---

## After DNS Propagates

### Test Access

1. Wait 2-5 min for DNS propagation
2. Verify: `dig n8n.neofreight.net +short` → should show `212.132.124.4`
3. Access: `https://n8n.neofreight.net`
   - User: `admin`
   - Pass: `calamardo2024`
4. Should load without 404 errors ✅

### Old URL Will Stop Working

`https://neofreight.net/n8n/` → Will no longer work (route removed)

Update bookmarks to use: `https://n8n.neofreight.net`

---

## Why Subdomain is Better

**Subpath problems:**
- SPAs generate absolute paths (breaks with strip_prefix)
- Requires app-level configuration (N8N_PATH env var)
- Complex Caddy rewrites for Location headers
- Assets 404 if app doesn't know its base path

**Subdomain benefits:**
- App thinks it's at root → paths work naturally
- No path stripping needed
- Simpler Caddy config
- Consistent with LNbits approach

---

## Rollback Plan

If subdomain doesn't work:
1. Re-add `/n8n/*` route to calamardo_routes.caddy
2. Configure n8n with `N8N_PATH=/n8n` environment variable
3. Restart n8n with new env var

---

**Next Step:** Wait for Daniel to add DNS A record, then test.
