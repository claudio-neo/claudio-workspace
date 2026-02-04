# Lightning Network+ (LN+) Requirements & Strategy

**Platform:** https://lightningnetwork.plus/  
**Purpose:** Facilitate peer-to-peer liquidity swaps between Lightning node operators  
**Date:** 2026-02-04

## What is Lightning Network+?

LN+ is a coordination platform where node operators organize **mutual channel openings** (liquidity swaps). Instead of opening channels one-by-one, operators form groups and open channels to each other simultaneously.

### Benefits
- **Balanced liquidity:** You get both inbound and outbound capacity
- **No trust required:** All channels open simultaneously using Bitcoin script
- **Network effect:** Connect to multiple well-connected nodes at once
- **Cost-effective:** Split on-chain fees across multiple channel opens

## Swap Types

| Type | Nodes | Your Channels | Peers' Channels to You |
|------|-------|---------------|------------------------|
| **Triangle** | 3 | Open 1 channel | 1 peer opens to you |
| **Pentagon** | 5 | Open 1 channel | 1 peer opens to you |
| **Dual** | 2 | Open 1 channel | 1 peer opens to you |
| **Quad** | 4 | Open 2 channels | 2 peers open to you |

**Most common:** Triangle and Pentagon swaps (simple, balanced)

## Minimum Requirements to Participate

### 1. Node Prerequisites
- ✅ **Synced LND node** (we have this: v0.20.0-beta, synced to block 934,992)
- ✅ **Public IP & port forwarding** (we have: 212.132.124.4:9735)
- ✅ **At least 1 existing channel** ⚠️ **WE DON'T HAVE THIS YET**
- ✅ **Adequate on-chain balance** (for channel opens + fees)

### 2. Authentication
LN+ uses **Lightning message signing** for authentication:
- Format: `lnplus-login-[random]-[random]-[random]`
- You sign the message with your node's private key
- Proves you control the Lightning node
- **Requires:** `lnd` with `signmessage` RPC access (we have admin.macaroon)

### 3. Minimum Capital Requirements

**Typical swap sizes:**
- **Small swaps:** 100,000 - 500,000 sats (0.001 - 0.005 BTC)
- **Medium swaps:** 500,000 - 2,000,000 sats (0.005 - 0.02 BTC)
- **Large swaps:** 2,000,000+ sats (0.02+ BTC)

**Our situation:**
- Current balance: **0 sats** ⚠️
- Need: ~200,000 sats minimum to participate in small swaps
- Plus: ~50,000 sats for on-chain fees (channel opens + reserve)

**Total needed to start:** ~250,000 sats (~0.0025 BTC, ~$250 USD at current prices)

## Current Blockers

| Requirement | Status | Blocker |
|-------------|--------|---------|
| Synced LND | ✅ Ready | - |
| Public node | ✅ Ready | - |
| Admin access | ✅ Ready | - |
| **≥1 channel** | ❌ Missing | Need to open first channel manually |
| **On-chain balance** | ❌ Missing | LND wallet has 0 sats |

## Strategy to Get Started

### Phase 1: Fund & Open First Channel (REQUIRED)
1. **Fund LND wallet:** Deposit ~300,000 sats (0.003 BTC)
   ```bash
   lncli newaddress p2wkh
   # Send BTC to this address
   # Wait for 3+ confirmations
   ```

2. **Open first channel manually:**
   - **Option A:** Well-known routing node (ACINQ, WalletOfSatoshi)
   - **Option B:** Known peer from LN+ member list
   - **Size:** 100,000 - 200,000 sats
   - **Purpose:** Establish node reputation + enable LN+ registration

3. **Wait for channel confirmation:** ~10 blocks (~100 minutes)

### Phase 2: Register on LN+
1. Visit https://lightningnetwork.plus/
2. Click "Sign in with Lightning"
3. Sign authentication message with `lncli signmessage`
4. Submit signature to prove node ownership
5. Complete profile (node alias, contact info, preferences)

### Phase 3: Join First Swap
1. **Browse available swaps:** https://lightningnetwork.plus/swaps
2. **Filter by:**
   - Swap size matching our budget (100k-200k sats)
   - Recent activity (posted within last 24h)
   - Participants with good ratings
3. **Apply to join swap:**
   - Commit to opening channel of specified size
   - Provide node pubkey and contact method
4. **Wait for coordination:**
   - Swap creator coordinates timing
   - All participants open channels simultaneously
   - Typically completes within 24-48 hours

### Phase 4: Build Reputation
- Complete 3-5 small swaps successfully
- Leave ratings for peers
- Gradually increase swap sizes
- Join recurring swap groups for regular liquidity

## Cost Breakdown (Initial)

| Item | Amount | Purpose |
|------|--------|---------|
| First manual channel | 150,000 sats | Enable LN+ registration |
| First LN+ swap | 150,000 sats | Build liquidity & reputation |
| On-chain fees | 30,000 sats | Channel opens + reserves |
| **Total** | **330,000 sats** | **~$330 USD at $100k/BTC** |

## Revenue Potential (Lightning Telegram Bot)

With 300k sats in channels, the bot can:
- **Accept deposits:** 0% fee → drive adoption
- **Process withdrawals:** 1% fee
- **Internal tips:** 0.5% fee

**Break-even scenario:**
- 30,000 sats in withdrawal fees = recover initial investment
- = 3,000,000 sats in withdrawal volume
- = ~300 users withdrawing 10,000 sats each

**Realistic timeline:** 3-6 months to break even with organic growth

## Risks & Considerations

### Liquidity Risk
- Channels may become unbalanced (all local or all remote)
- Mitigation: Use LN+ to maintain balanced liquidity via swaps
- Cost: Minimal (only on-chain fees for rebalancing)

### Channel Closure Risk
- Peers may close channels unilaterally
- Mitigation: Choose peers with good ratings on LN+
- Impact: Lose routing fees, need to re-open channels

### Capital Lock-up
- Sats in channels are illiquid until channel closes
- Mitigation: Start small, scale gradually
- Recommendation: Don't deploy >50% of available capital initially

## Recommended First Steps

**Immediate (waiting for funding):**
1. ✅ Research LN+ platform (DONE - this document)
2. Create LN+ account strategy document
3. Identify 5-10 target swap groups to join
4. Research well-connected first channel targets

**After funding arrives:**
1. Open first channel to ACINQ or similar (high-uptime routing node)
2. Register on LN+ with message signing
3. Join 1-2 small triangle swaps (100k-150k sats each)
4. Monitor channel health and routing activity
5. Scale up to medium swaps once reputation builds

## Technical Implementation Notes

### LND Commands Needed
```bash
# Generate on-chain address
lncli newaddress p2wkh

# Check wallet balance
lncli walletbalance

# List available peers
lncli listpeers

# Connect to peer
lncli connect <pubkey>@<host>:<port>

# Open channel
lncli openchannel --node_key <pubkey> --local_amt <sats>

# Sign message for LN+ auth
lncli signmessage "lnplus-login-xxxxx-xxxxx-xxxxx"

# Check channel status
lncli listchannels

# Get node URI for sharing
lncli getinfo | jq -r '.uris[0]'
```

### Automation Opportunities
- **Channel health monitoring:** Alert when channels become unbalanced
- **Swap coordination bot:** Auto-join swaps matching criteria
- **Fee optimization:** Adjust routing fees based on channel state
- **LN+ profile updater:** Keep node info current

## Next Actions

**Documented research:** ✅ Complete  
**Funding required:** 300,000 - 500,000 sats  
**Decision needed:** Should Daniel fund the node for LN+ participation?  
**Timeline:** Once funded, ~1 week to complete Phase 1-3  

---

**Note:** This strategy assumes mainnet operation with real Bitcoin. Testnet participation is possible for learning but doesn't build real-world reputation or revenue.
