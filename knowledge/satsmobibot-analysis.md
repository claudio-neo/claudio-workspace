# SatsMobiBot - Analysis & Comparison

## Overview

**GitHub:** https://github.com/massmux/SatsMobiBot  
**Public Bot:** @SatsMobiBot (https://t.me/SatsMobiBot)  
**Language:** Go  
**Status:** Active, production-ready

**Description:** Lightning wallet Telegram bot with POS, Scrub, and NFC cards.

## Key Architecture

```
Telegram Bot (Go)
    ↓
LNbits (Lightning backend)
    ↓
LND / CLN / Other backends
```

**Crucial insight:** Usa **LNbits** como abstraction layer.

## LNbits: The Key Component

**LNbits** = Free and open-source Lightning wallet/accounts system

### What LNbits Does
- Multi-user wallet management
- Extensions/plugins ecosystem
- REST API for bot integration
- Supports multiple Lightning backends:
  - LND ✅ (lo que tengo)
  - CLN (Core Lightning)
  - LNPay
  - OpenNode
  - And more...

### Why This Matters for Me

**LNbits puede usar MI LND como backend.**

Esto significa:
1. Instalo LNbits
2. Lo conecto a mi LND existente
3. LNbits gestiona las cuentas de usuarios
4. Mi bot habla con LNbits API (no directamente con LND)

**Ventaja:** LNbits ya resuelve el problema de múltiples usuarios + accounting.

## SatsMobiBot Features

### Core Wallet
- Send/receive Lightning payments
- Balance management
- Transaction history
- Lightning Address (@sats.mobi)

### POS (Point of Sale)
- Integrated POS for merchants
- Generate payment links
- External device support
- Currency conversion (EUR, etc)

### Scrub Service
**Feature única:** Auto-forward payments to external address.

**Use case:** Merchant no custodia fondos realmente.
- Activas Scrub con tu Lightning address
- Todos los pagos incoming se forwardean automáticamente
- POS "non-custodial" para el merchant

### NFC Cards
- Physical NFC cards connected to balance
- Cashback commands
- Card activation notifications
- Spend sats with NFC tap

### Additional
- LNURL support
- QR code generation
- Group chat integration
- Nostr integration (private key in config)
- AI features (DALL-E, OpenAI - optional)

## Configuration

**Backend requirements:**
```yaml
lnbits:
  url: "https://mylnbits.com"
  admin_key: "LNBITS_ADMIN_KEY"
  admin_id: "LNBITS_ADMIN_ID"
  webhook_server: "http://bot:5588"

database:
  db_path: "data/bot.db"  # SQLite
  
pos:
  currency: "EUR"
  max_balance: 1000000  # 1M sats max
```

**Multiple databases:**
- bot.db (users, accounts)
- transactions.db (tx history)
- groups.db (group chats)
- shop.db (POS data)
- bunt.db (key-value store)

## Comparison: My Options

| Feature | My Custom Bot | SatsMobiBot | lntxbot |
|---------|--------------|-------------|---------|
| **Language** | Node.js | Go | Go |
| **Backend** | Direct NWC/LND | LNbits → LND | Cliche |
| **Dependencies** | PostgreSQL + NWC | LNbits + SQLite | PostgreSQL + Redis + Cliche |
| **POS** | ❌ | ✅ | ❌ |
| **NFC Cards** | ❌ | ✅ | ❌ |
| **Scrub/Forward** | ❌ | ✅ | ❌ |
| **Lightning Address** | ❌ | ✅ (@sats.mobi) | ❌ |
| **LNURL** | ❌ | ✅ | ✅ |
| **Development** | In progress | Production | Production |
| **Control** | Full | Full (if self-hosted) | Full (if self-hosted) |
| **Setup Complexity** | Medium | Medium | High |

## LNbits Integration Path

### Option: Pivot to LNbits

**Instead of direct NWC/LND integration, use LNbits:**

**Pros:**
- Mature multi-user wallet system
- Accounts/balance already solved
- Extensions ecosystem (POS, LNURL, etc)
- Works with my LND
- REST API well-documented
- Active development

**Cons:**
- Additional component (LNbits server)
- Learning curve
- My NWC implementation goes unused (but not wasted - different use case)

### Setup Process

1. **Install LNbits**
   ```bash
   docker run -d --name lnbits \
     -p 5000:5000 \
     -v ~/.lnbits:/data \
     lnbits/lnbits:latest
   ```

2. **Connect to my LND**
   - Configure LNbits with LND credentials
   - Point to my existing node
   - LNbits uses my liquidity

3. **Choose bot approach:**
   - **A:** Use SatsMobiBot as-is
   - **B:** Build my bot but use LNbits API instead of NWC
   - **C:** Fork SatsMobiBot and customize

## SatsMobiBot Deployment

**If I choose to use SatsMobiBot:**

```bash
# 1. Setup LNbits first (connected to my LND)

# 2. Clone SatsMobiBot
git clone https://github.com/massmux/SatsMobiBot
cd SatsMobiBot

# 3. Configure
cp config.yaml.example config.yaml
# Edit with:
# - Telegram bot token
# - LNbits URL + admin key
# - Public hostname for LNURL

# 4. Run with Docker
docker-compose up -d

# Done - bot operational
```

**Time to deploy:** ~2 hours (assuming LNbits is already running)

## Feature Analysis: What I Need vs What's Available

### Must-Have (My Requirements)
- [x] Send/receive Lightning ✅ (All bots)
- [x] Internal transfers with fees ✅ (All bots)
- [x] Balance management ✅ (All bots)
- [x] Transaction history ✅ (All bots)

### Nice-to-Have
- [ ] POS system - ✅ SatsMobiBot only
- [ ] Lightning Address - ✅ SatsMobiBot only
- [ ] LNURL support - ✅ SatsMobiBot, lntxbot
- [ ] NFC cards - ✅ SatsMobiBot only
- [ ] Scrub/forward - ✅ SatsMobiBot only

### My Custom Features
- [x] Uses my existing LND ✅
- [x] Uses my NWC ✅
- [x] Full control of code ✅

## Decision Matrix

### Path A: Continue Custom Bot
**Timeline:** 2-3 days for MVP  
**Pros:** Full control, uses NWC, learning experience  
**Cons:** No advanced features (POS, NFC, LNURL), more development

### Path B: Deploy SatsMobiBot
**Timeline:** 2 hours to deploy  
**Pros:** Production-ready, advanced features, active project  
**Cons:** Go codebase (less familiar), need to learn LNbits

### Path C: Hybrid (Custom bot + LNbits API)
**Timeline:** 3-4 days  
**Pros:** Node.js (familiar), LNbits benefits, custom control  
**Cons:** Medium complexity, still need to build features

### Path D: Fork SatsMobiBot
**Timeline:** 1 week+ to understand codebase  
**Pros:** Start with full features, customize as needed  
**Cons:** Go learning curve, maintenance burden

## Recommendation for Daniel

**Given "haz lo que creas conveniente":**

**Short-term (next 24h):** Deploy SatsMobiBot
- Fastest path to working bot
- Production features included
- Test market demand quickly
- LNbits + my LND = operational

**Medium-term (week 1-2):** Evaluate
- User feedback on features needed
- Revenue validation
- Decide: keep SatsMobiBot or build custom

**Long-term:** Custom if needed
- Build only what's actually used
- Optimize for our specific use case
- Keep NWC for other integrations

## LNbits: The Missing Piece

**I should have known about LNbits earlier.**

It's THE standard for multi-user Lightning wallets:
- Used by many bots (SatsMobiBot, others)
- Pluggable backends (works with my LND)
- Extensions for everything (POS, LNURL, Nostr, etc)
- Active community

**My NWC implementation:**
- Still valuable for AI agent payments
- Different use case (programmatic vs human users)
- Can coexist with LNbits

## Next Steps

**Immediate questions for Daniel:**

1. **Deploy SatsMobiBot as-is?** (2 hours, production-ready)
2. **Or continue custom bot?** (2-3 days, basic features)
3. **Features priority?** (Just wallet? Or POS/NFC too?)
4. **Timeline?** (Fast launch vs custom control?)

**My lean:**
- Start with SatsMobiBot to validate demand
- If successful, customize or rebuild
- Don't over-engineer before market validation

## Installation Commands (If We Go with SatsMobiBot)

```bash
# 1. Install LNbits
docker run -d --name lnbits \
  -p 5000:5000 \
  -v ~/lnbits-data:/data \
  -e LND_REST_ENDPOINT=https://127.0.0.1:8081 \
  -e LND_MACAROON_FILE=/lnd/admin.macaroon \
  -e LND_CERT_FILE=/lnd/tls.cert \
  lnbits/lnbits:latest

# 2. Access LNbits: http://localhost:5000
# 3. Get admin key from LNbits UI
# 4. Clone SatsMobiBot
git clone https://github.com/massmux/SatsMobiBot ~/satsmobibot
cd ~/satsmobibot

# 5. Configure
cp config.yaml.example config.yaml
# Edit config.yaml with Telegram token, LNbits URL/key

# 6. Deploy
docker-compose up -d

# 7. Test bot in Telegram
```

---

**Status:** Analysis complete, awaiting direction  
**Recommendation:** Deploy SatsMobiBot (fast) or continue custom (control)  
**Key discovery:** LNbits is the missing middleware I didn't know I needed

*Analyzed: 2026-02-04 07:45 UTC*  
*Source: Daniel's recommendation*
