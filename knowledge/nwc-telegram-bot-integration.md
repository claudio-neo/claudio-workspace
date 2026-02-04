# NWC + Telegram Bot Integration Research
**Created:** 2026-02-04 21:25 UTC  
**Context:** Task 6 - Investigating decentralized protocols (Nostr + Lightning)

## Current Setup
- **NWC service:** Production-ready (`/home/neo/nwc/simple-wallet-service.js`)
- **Relay:** wss://relay.damus.io (public)
- **Lightning Bot:** Direct LND integration (custom implementation)
- **Both operational:** NWC + Telegram bot run independently

## Why Integrate?

### Current Architecture
```
Telegram Bot → LND REST API (direct)
NWC Service → LND REST API (direct)
```

Both talk to LND separately. No bridge.

### Potential Integration
```
Telegram Bot → NWC (Nostr) → LND
```

**Benefits:**
1. **Standardized interface:** NIP-47 protocol vs custom LND REST calls
2. **Remote wallet support:** Users could connect their own NWC wallets
3. **Interoperability:** Other Nostr apps could interact with bot's wallet
4. **Decentralization:** Wallet service decoupled from messaging platform

**Drawbacks:**
1. **Added complexity:** Extra layer vs direct LND
2. **Latency:** Nostr relay roundtrip vs local REST call
3. **Already working:** Current implementation is stable and fast

## Use Cases

### 1. User BYO Wallet (Bring Your Own)
Instead of custodial bot wallet:
- User generates NWC connection string (e.g., Alby, Mutiny)
- Bot stores NWC URI instead of balance in DB
- Payments go directly to user's external wallet
- **Non-custodial model**

### 2. Bot as NWC Provider
Expose bot's wallet via NWC:
- Users could connect to bot from other apps (Zeus, Amethyst)
- Invoice generation via Nostr instead of Telegram commands
- Multi-platform wallet access

### 3. Cross-Platform Tipping
Nostr users tip Telegram users (and vice versa):
- Bridge NIP-57 (Nostr zaps) with Telegram `/tip`
- Unified Lightning economy across platforms

## Technical Implementation

### Phase 1: NWC Client in Bot
Replace direct LND calls with NWC client:

```javascript
// Old (direct LND)
const invoice = await lndRequest('POST', '/v1/invoices', {...});

// New (via NWC)
const invoice = await nwcClient.makeInvoice(amount, memo);
```

**Files to modify:**
- `/home/neo/lightning-telegram-bot/bot.js` (279 LOC LND calls)
- Create: `/home/neo/lightning-telegram-bot/nwc-client.js`

**Complexity:** Medium (1-2 hours)

### Phase 2: User-Owned Wallets
Allow users to connect external NWC wallets:

```sql
ALTER TABLE users ADD COLUMN nwc_uri TEXT;
```

**New commands:**
- `/connect <nwc_uri>` - Link external wallet
- `/disconnect` - Revert to custodial

**Complexity:** High (requires permission system, fallback logic)

### Phase 3: Bot as NWC Provider
Expose bot wallet to external apps:

```javascript
// New service: nwc-telegram-bridge.js
// Listens for NIP-47 events
// Executes via Telegram bot's LND connection
```

**Complexity:** High (new daemon, authentication, rate limiting)

## Decision Matrix

| Option | Pros | Cons | Effort |
|--------|------|------|--------|
| **Keep Direct LND** | Fast, simple, working | Platform-locked, custodial-only | None |
| **Phase 1 (NWC Client)** | Standard protocol, cleaner code | Added latency, more deps | Medium |
| **Phase 2 (User Wallets)** | Non-custodial option, privacy | Complex UX, support burden | High |
| **Phase 3 (NWC Provider)** | Multi-platform access | Security concerns, maintenance | High |

## Recommendation

**For now: Keep direct LND**

**Reasons:**
1. Current implementation works well (0 latency issues)
2. Target users expect custodial simplicity
3. NWC integration adds complexity without clear user demand
4. Can revisit if:
   - Users request non-custodial option
   - Need cross-platform wallet access
   - Performance becomes bottleneck (unlikely)

**Future enhancement:**
- Add Phase 2 as **opt-in feature** when user demand exists
- Keep direct LND as default (fast path)
- NWC as advanced option (non-custodial path)

## Related Research

### NIP-47 Methods Bot Currently Implements (via direct LND)
- ✅ `make_invoice` → `/receive` command
- ✅ `pay_invoice` → `/send` command
- ✅ `get_balance` → `/balance` command
- ✅ `get_info` → Bot metadata
- ❌ `list_transactions` → Could add via `/history`
- ❌ `lookup_invoice` → Used internally for monitoring

Bot already implements ~80% of NIP-47 spec via custom LND calls.

### Nostr Ecosystem Alignment
- **Bolt.fun:** Lightning apps showcase - could submit bot
- **Nostr marketplace:** NIP-15 (marketplace) + bot paywalls = merchant tool
- **Zaps integration:** Future: bridge Telegram tips ↔ Nostr zaps

## Action Items

**Immediate (this session):**
- [x] Document current state vs NWC integration options
- [x] Evaluate trade-offs
- [x] Recommend path forward

**Future (if user demand emerges):**
- [ ] Implement Phase 2 (user-owned wallets) as opt-in
- [ ] Create NIP-47 spec comparison doc
- [ ] Explore Nostr marketplace integration

## Conclusion

Direct LND integration is the right choice for current needs. NWC integration would be premature optimization without proven demand. Document this research for future reference when scaling decisions arise.

---

**Research time:** 15 minutes  
**Result:** Strategic clarity - stay with working solution, defer complexity
