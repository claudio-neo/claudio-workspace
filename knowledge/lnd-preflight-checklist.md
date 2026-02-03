# LND Pre-Flight Checklist
**Status:** READY to launch | Bitcoin 100% synced | LND v0.20.0-beta installed
**Created:** 2026-02-03 04:20 UTC

## Current State
- **Bitcoin Core:** v29.2.0, mainnet, pruned (550MB), 934,786 blocks (100%), 10 peers
- **LND:** v0.20.0-beta, installed but NOT running
- **Compatibility:** prune=550 is aggressive for LND (see concerns below)

## Pre-Launch Checks

### 1. Bitcoin Node Health
```bash
bitcoin-cli getblockchaininfo | jq '{blocks, headers, verificationprogress, pruned, pruneheight}'
bitcoin-cli getpeerinfo | jq 'length'
bitcoin-cli getnetworkinfo | jq '{version, subversion, connections}'
```
**Expected:**
- blocks == headers (fully synced)
- verificationprogress ≈ 0.9999...
- pruned: true, pruneheight: recent
- connections: 10+

### 2. Disk Space
```bash
df -h /home/neo  # Check available space
du -sh ~/.bitcoin  # Bitcoin data size
du -sh ~/.lnd 2>/dev/null || echo "LND not initialized"
```
**Requirement:** At least 10GB free for LND channel graph + routing data

### 3. LND Configuration Review
```bash
cat ~/.lnd/lnd.conf
```
**Critical settings:**
- `bitcoin.mainnet=1`
- `bitcoin.active=1`
- `bitcoin.node=bitcoind`
- `bitcoind.rpcuser` and `bitcoind.rpcpass` match Bitcoin Core RPC settings
- `bitcoind.zmqpubrawblock` and `bitcoind.zmqpubrawtx` configured (ZMQ required)

### 4. ZMQ Setup (CRITICAL)
LND requires ZMQ for block/tx notifications. Verify Bitcoin Core has:
```bash
bitcoin-cli getzmqnotifications
```
**If empty:** Need to add to bitcoin.conf:
```
zmqpubrawblock=tcp://127.0.0.1:28332
zmqpubrawtx=tcp://127.0.0.1:28333
```
Then restart bitcoind.

### 5. Firewall & Ports
```bash
sudo ufw status | grep -E '9735|10009'
```
**Needed:**
- Port 9735 (Lightning P2P): OPEN for incoming if public node
- Port 10009 (gRPC): Localhost only (or secured)
- Port 8080 (REST API): Optional, localhost only

## Launch Sequence

### Step 1: Initialize LND Wallet
```bash
lnd
# In another terminal:
lncli create
```
**Backup:** Save seed phrase (24 words) securely IMMEDIATELY

### Step 2: Unlock Wallet
```bash
lncli unlock
```

### Step 3: Verify Sync
```bash
lncli getinfo | jq '{synced_to_chain, synced_to_graph, block_height, num_active_channels}'
```
Wait until `synced_to_chain: true` (may take 1-2 hours for graph sync)

### Step 4: Fund Wallet
```bash
lncli newaddress p2wkh  # Get deposit address
# Send BTC from external wallet
lncli walletbalance
```

### Step 5: Open First Channel
**Research first:** Choose well-connected node (1ML rankings)
```bash
lncli connect <pubkey>@<host>:<port>
lncli openchannel <pubkey> <amount_sats>
```
Wait 3-6 confirmations for channel to become active.

## Prune Warning
**Current prune=550MB is very aggressive.** 

**Risks:**
- LND may struggle with historical block lookups
- Channel force-closes might fail if old blocks are pruned
- Recommended: prune=10000 (~10GB) minimum for LND

**Options:**
1. **Increase prune target:** Edit bitcoin.conf, set `prune=10000`, restart bitcoind (will re-sync pruned data)
2. **Accept risk:** Monitor closely, be prepared for edge cases
3. **Wait for more disk:** Delay LND until server has more space

**Daniel's decision needed on this before launch.**

## systemd Service (Optional)
Once stable, create `/etc/systemd/system/lnd.service`:
```ini
[Unit]
Description=LND Lightning Network Daemon
After=bitcoind.service

[Service]
User=neo
ExecStart=/home/neo/lnd-linux-amd64-v0.20.0-beta/lnd
Restart=on-failure
RestartSec=60

[Install]
WantedBy=multi-user.target
```
Enable: `sudo systemctl enable lnd && sudo systemctl start lnd`

## Post-Launch Monitoring
- **Daily:** `lncli getinfo`, check sync status
- **Channel health:** `lncli listchannels`, monitor balances
- **Routing activity:** `lncli fwdinghistory`
- **Logs:** `tail -f ~/.lnd/logs/bitcoin/mainnet/lnd.log`

## Resources
- LND docs: https://docs.lightning.engineering
- Channel management: https://terminal.lightning.engineering
- Node rankings: https://1ml.com
- Route analysis: https://amboss.space

## Recommendation
**Before launch:**
1. Decide on prune setting (increase to 10GB recommended)
2. Verify ZMQ configured in Bitcoin Core
3. Plan initial channels (research well-connected peers)
4. Prepare backup strategy for seed + channel.backup

**When to launch:** After above decisions made + Daniel gives GO signal.

---
*Prepared by Claudio 🦞 | 2026-02-03 04:20 UTC*
