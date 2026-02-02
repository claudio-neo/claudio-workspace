# LND Launch Checklist — Verified 2026-02-02

## Current State ✅
- **Bitcoin node:** v29.2, 100% synced (934,662 blocks), pruned
- **LND binary:** v0.20.0-beta installed at `/home/neo/lnd-linux-amd64-v0.20.0-beta/`
- **ZMQ:** ✅ Listening on 127.0.0.1:28332 (blocks) + 28333 (tx)
- **RPC:** ✅ Configured, matching in bitcoin.conf and lnd.conf
- **LND config:** `~/.lnd/lnd.conf` — ready

## Pre-Launch Steps

### Step 1: Reduce dbcache (saves ~1.5GB RAM)
```bash
# Edit bitcoin.conf
sed -i 's/dbcache=2048/dbcache=512/' ~/.bitcoin/bitcoin.conf
# Restart bitcoind
/home/neo/bitcoin-29.2/bin/bitcoin-cli stop
sleep 10
/home/neo/bitcoin-29.2/bin/bitcoind -datadir=/home/neo/.bitcoin -daemon
```
**Why:** dbcache=2048 was for IBD speed. Post-IBD, 512MB is plenty. Frees ~1.5GB for LND.
**Current RAM:** bitcoind using ~4GB (will drop to ~2.5GB)

### Step 2: Start LND
```bash
/home/neo/lnd-linux-amd64-v0.20.0-beta/lnd &
```

### Step 3: Create Wallet (⚠️ REQUIRES DANIEL)
```bash
/home/neo/lnd-linux-amd64-v0.20.0-beta/lncli create
```
- **This generates a 24-word seed phrase**
- **Seed MUST go to Daniel offline** (never stored digitally)
- Daniel chooses a wallet password
- Option: cipher seed passphrase (extra security layer)

### Step 4: Verify
```bash
/home/neo/lnd-linux-amd64-v0.20.0-beta/lncli getinfo
/home/neo/lnd-linux-amd64-v0.20.0-beta/lncli walletbalance
```

## Decisions for Daniel

### 1. Routing Node vs Personal Node?
| | Routing | Personal |
|--|---------|----------|
| Purpose | Earn fees routing payments | Send/receive own payments |
| Capital | Needs BTC for channel liquidity | Minimal |
| Complexity | High (fee management, rebalancing) | Low |
| Maintenance | Active | Passive |
| Recommended for start | ❌ | ✅ |

**Recommendation:** Start personal, upgrade to routing later if desired.

### 2. Tor?
Currently `tor.active=0`. Options:
- **Off:** Direct connections, faster, but IP is visible to peers
- **On:** Anonymous, slower, more privacy
- **Hybrid:** Tor + clearnet (most flexible)

**Recommendation:** Enable Tor hybrid for privacy.

### 3. Prune Concern
- Current: `prune=550` (550MB)
- LND docs warn "aggressive pruning can lead to performance loss"
- LND needs to fetch missed blocks from network if pruned too aggressively
- **550MB is the minimum Bitcoin Core allows** — this IS aggressive
- Consider increasing to `prune=2000` (2GB) if disk allows (we have 373GB free)

### 4. Port 9735
- Currently `listen=0.0.0.0:9735` — publicly accessible
- Needed for incoming connections (routing, receiving channels)
- If Tor-only, can remove this (Tor handles connections)

## Post-Launch TODO
- [ ] Set up systemd service for LND
- [ ] Fund wallet (Daniel sends sats)
- [ ] Open first channel (recommended: well-connected node like ACINQ, Blockstream, etc.)
- [ ] Configure watchtower (optional, protects against channel fraud while offline)
- [ ] Back up channel.backup file (SCB — Static Channel Backup)

## Systemd Service Template
```ini
[Unit]
Description=LND Lightning Daemon
After=bitcoind.service
Wants=bitcoind.service

[Service]
User=neo
ExecStart=/home/neo/lnd-linux-amd64-v0.20.0-beta/lnd
Restart=always
RestartSec=30

[Install]
WantedBy=multi-user.target
```

## Paths
- LND binary: `/home/neo/lnd-linux-amd64-v0.20.0-beta/lnd`
- lncli: `/home/neo/lnd-linux-amd64-v0.20.0-beta/lncli`
- LND config: `~/.lnd/lnd.conf`
- LND data: `~/.lnd/`
- Bitcoin config: `~/.bitcoin/bitcoin.conf`
- Bitcoin data: `~/.bitcoin/`

---
*Verified: 2026-02-02 01:25 UTC*
*All configs checked against running services*
