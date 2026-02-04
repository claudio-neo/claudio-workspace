# LNbits + SatsMobiBot Deployment Log

**Date:** 2026-02-04  
**Goal:** Deploy custodial Lightning Telegram bot for revenue generation  
**Architecture:** Telegram Bot (SatsMobiBot) → LNbits → LND → Bitcoin Network

## Components

### LNbits (Lightning Accounts System)
- **Version:** 1.4.2
- **Container:** `lnbits` 
- **Network Mode:** `host` (listening on 0.0.0.0:5000)
- **Database:** SQLite at `/app/data/database.sqlite3`
- **Backend:** LND REST (127.0.0.1:8081)
- **Admin ID:** `d4ff3ddcbacf4dc6b600c1e5a56bb6e2`
- **Admin Key:** `c315d657ea364a5ea19de7f4ab432203`

**Status:** ✅ Running, connected to LND, but **needs first_install setup**

### SatsMobiBot (Telegram Bot)
- **Image:** `massmux/satsmobi`
- **Container:** `satsmobi`
- **Bot Token:** `8581698217:AAGxWIQcF4HMnNrkd0rjpiWDkRp7EildJyI`
- **Bot Username:** `@Lightningeasybot`
- **Ports:** 5454 (LNURL), 5588 (webhook), 6060 (admin)

**Status:** ⚠️ Container running but bot non-functional

## Problem Identified

**Root Cause:** SatsMobiBot requires LNbits **UserManager extension** which is not installed.

### Evidence
1. SatsMobiBot code uses `/usermanager/api/v1/*` endpoints
2. LNbits shows `"EXTENSIONS": []` (no extensions installed)
3. LNbits redirects to `/first_install` (setup incomplete)
4. Bot logs show: `[createWallet] Create wallet error: ""`

### Why UserManager?
SatsMobiBot creates separate wallets for each Telegram user:
```go
// internal/lnbits/lnbits.go
resp, err := req.Post(c.url+"/usermanager/api/v1/users", ...)
```

Without UserManager:
- Bot can't create user wallets
- Can't isolate user balances
- Can't function as custodial service

## Attempted Solutions

### ❌ CLI Extension Install
```bash
docker exec lnbits uv run lnbits-cli extensions install usermanager --url http://127.0.0.1:5000
```
**Result:** Failed - no extension repositories configured

### ❌ API Extension Install
```bash
curl -X POST "http://localhost:5000/api/v1/extension" ...
```
**Result:** No API endpoint available for extension installation

### ❌ Manual Extension Copy
```bash
docker exec lnbits ls /app/lnbits/extensions/
```
**Result:** Directory empty - extensions not bundled in Docker image

## Network Configuration Evolution

### Iteration 1: Default Bridge Network
```yaml
services:
  satsmobi:
    ports:
      - 5454:5454
      - 5588:5588
      - 6060:6060
```
**Config:**
```yaml
lnbits:
  url: "http://host.docker.internal:5000"
```
**Result:** ❌ DNS error - `host.docker.internal` not available on Linux

### Iteration 2: Docker Bridge Gateway
```yaml
lnbits:
  url: "http://172.17.0.1:5000"
```
**Result:** ❌ Timeout - LNbits not accessible from bridge network

### Iteration 3: Host Network (Current)
```yaml
services:
  satsmobi:
    network_mode: host
```
**Config:**
```yaml
lnbits:
  url: "http://localhost:5000"
  lnbits_public_url: "http://localhost:5000"
  webhook_call: "http://localhost:5000"
  webhook_server: "http://localhost:5588"
bot:
  lnurl_server: "http://localhost:5454"
  admin_api_host: localhost:6060
```
**Result:** ✅ Network connectivity works, but blocked by missing extension

## Proposed Solutions

### Option A: Web UI Setup (5 minutes) ⭐ RECOMMENDED
1. Expose LNbits port temporarily: `ssh -L 5000:localhost:5000 user@server`
2. Open `http://localhost:5000/first_install` in browser
3. Complete first-install wizard
4. Navigate to Admin UI → Extensions
5. Install "User Manager" extension
6. Restart SatsMobiBot: `cd ~/satsmobibot && docker compose restart`

**Pros:**
- Fastest solution (5 min)
- Uses production-ready SatsMobiBot
- Gets all features: POS, NFC, Scrub, LNURL

**Cons:**
- Requires manual browser interaction
- Can't be fully automated

### Option B: Custom Simple Bot (30-60 minutes)
Build minimal custodial bot using LND REST directly:
```javascript
// bot.js
const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');

// Direct LND REST calls
// /balance, /addinvoice, /payinvoice
```

**Pros:**
- No LNbits dependency
- Fully automated deployment
- Educational (learn Lightning + Telegram integration)

**Cons:**
- 30-60 min development time
- No advanced features (POS, NFC, Scrub)
- Manual user balance management (need own database)

### Option C: Fork SatsMobiBot (2-3 hours)
Modify SatsMobiBot to use basic LNbits API instead of UserManager:
```go
// Replace /usermanager/api/v1/users
// with direct wallet creation via /api/v1/wallet
```

**Pros:**
- Keeps SatsMobiBot features
- No manual browser step

**Cons:**
- Most time-consuming (2-3 hours)
- Need to maintain fork
- May break on upstream updates

## LNbits Database Schema

```sql
-- accounts table
CREATE TABLE accounts (
    id TEXT PRIMARY KEY,
    ...
);

-- wallets table  
CREATE TABLE wallets (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    "user" TEXT NOT NULL,
    adminkey TEXT NOT NULL,
    inkey TEXT,
    currency TEXT,
    deleted BOOLEAN DEFAULT false,
    ...
);
```

**Current state:**
- 1 account: `d4ff3ddcbacf4dc6b600c1e5a56bb6e2` (superuser)
- 1 wallet: `77a4855ba9cf4d168be64bc0aa506a4c` ("LNbits wallet")

## Next Steps (Pending Decision)

Waiting on Daniel to choose:
- **A:** Manual web setup (fastest, recommended)
- **B:** Custom simple bot (automated, minimal features)
- **C:** Fork SatsMobiBot (time-consuming, full features)

## Files Modified

```
~/satsmobibot/config.yaml          # Bot configuration
~/satsmobibot/docker-compose.yml   # Container definition
~/satsmobibot-credentials.txt      # Stored credentials
~/telegram-bot-creation.txt        # Bot token from @BotFather
```

## Useful Commands

```bash
# Check containers
docker ps
docker logs lnbits
docker logs satsmobi

# LNbits database
docker cp lnbits:/app/data/database.sqlite3 /tmp/lnbits.db
sqlite3 /tmp/lnbits.db ".tables"

# LNbits CLI
docker exec lnbits uv run lnbits-cli superuser
docker exec lnbits uv run lnbits-cli extensions list

# Restart bot
cd ~/satsmobibot && docker compose restart

# Network debugging
docker inspect lnbits | jq -r '.[0].HostConfig.NetworkMode'
ss -tlnp | grep 5000
```

## Lessons Learned

1. **Docker host network vs bridge:** On Linux, `host.docker.internal` doesn't exist - use `172.17.0.1` or `network_mode: host`
2. **LNbits first install:** Must complete web setup before extensions work
3. **Extension installation:** Can't be done via API/CLI without first install
4. **UserManager dependency:** SatsMobiBot is tightly coupled to this extension
5. **Empty error messages:** When LNbits returns `""` error, usually means request succeeded but operation failed silently

---

**Status as of 2026-02-04 09:15 UTC:** Blocked, awaiting Daniel's decision on deployment strategy.

---

## Update 2026-02-04 10:47 UTC - Manual Extension Installation

### Progress Made

**✅ UserManager Extension Installed Manually**

Since browser automation wasn't available, installed extension directly:

```bash
# Clone extension from GitHub
cd /tmp
git clone https://github.com/lnbits/usermanager.git

# Copy to LNbits container
docker cp /tmp/usermanager lnbits:/app/lnbits/extensions/

# Restart LNbits
docker restart lnbits
```

**Result:** Extension detected and migrations ran successfully:
```
running migration usermanager.1
running migration usermanager.2  
running migration usermanager.3
Installed Extensions (1):
usermanager (0.0)
```

### Current Status

**LNbits:**
- ✅ Running on port 5000
- ✅ Superuser configured (d4ff3ddcbacf...)
- ✅ UserManager extension installed
- ✅ Admin UI accessible with `?usr=superuser_id`
- ⚠️ Redirects to `/first_install` without user parameter

**SatsMobiBot:**
- Container running
- Connected to Telegram (@Lightningeasybot)
- Still failing to create bot wallet:
  ```
  [createWallet] Create wallet error: ""
  [initBotWallet] Could not initialize bot wallet: ""
  ```

### Root Cause Analysis

**Why SatsMobiBot fails:**

1. **LNbits behavior:** Redirects all requests without `?usr=` to `/first_install`
2. **SatsMobiBot expects:** Direct API access to `/usermanager/api/v1/users`
3. **API returns:** 307 redirect instead of 200 OK
4. **Result:** Bot can't create wallets (empty error = redirect response)

**Verification:**
```bash
# Without user param - redirects
curl http://localhost:5000/usermanager/
# → 307 Temporary Redirect to /first_install

# With superuser param - works
curl http://localhost:5000/admin?usr=d4ff3ddcbacf4dc6b600c1e5a56bb6e2
# → 200 OK
```

### Possible Solutions

#### Option 1: Configure LNbits to Skip First Install
- Look for environment variable or config to disable first_install redirect
- May require editing LNbits source or settings

#### Option 2: Modify SatsMobiBot Config
- Add user parameter to all API calls
- Or use different authentication method

#### Option 3: Build Custom Bot (Original Option B)
- Bypass LNbits UserManager entirely
- Use LND REST API directly
- Simpler architecture, no UserManager dependency

### Next Steps (Pending Decision)

Waiting on Daniel to choose approach:
1. Debug SatsMobiBot further (investigate redirect bypass)
2. Build custom simple bot (30-60 min, working solution)
3. Wait for PC access to investigate together

### Files Modified
```
/tmp/usermanager/           # Cloned extension
lnbits:/app/lnbits/extensions/usermanager/  # Installed extension
```

### Lessons Learned

1. **LNbits Docker image ships without extensions** - must install separately
2. **Manual extension install works** - just clone + copy + restart
3. **first_install redirect is sticky** - even with superuser configured
4. **SatsMobiBot tightly coupled** - expects specific LNbits behavior
5. **Empty errors mean HTTP redirects** - not actual API errors

---

**Time invested:** ~2 hours troubleshooting + manual installation  
**Status:** 90% complete, blocked on configuration detail  
**Alternative ready:** Custom bot can be built in 30-60 min if needed
