---
name: bitcoin-node-monitor
description: Monitor Bitcoin Core node status (sync progress, peers, mempool, blocks) via bitcoin-cli. Use when checking node health, sync status, network connectivity, or mempool activity.
user-invocable: true
metadata: {"clawdbot":{"emoji":"₿","requires":{"bins":["bitcoin-cli"]}}}
---

# Bitcoin Node Monitor (₿)

Monitor and manage your Bitcoin Core node via `bitcoin-cli`. Get sync status, peer info, mempool stats, and block data.

**Made for:** Self-sovereign Bitcoin runners

![Bitcoin Node Monitor — Keep your node healthy](https://bitcoin.org/img/icons/opengraph.png)

---

## Prerequisites

- **Bitcoin Core** installed and running
- **bitcoin-cli** accessible in PATH
- **RPC credentials** configured (`~/.bitcoin/bitcoin.conf`)

---

## Commands

| Command | Description |
|---------|-------------|
| `/bitcoin status` | Node sync status, blocks, verification progress |
| `/bitcoin peers` | Connected peers count & details |
| `/bitcoin mempool` | Mempool size, fees, transactions |
| `/bitcoin block [height]` | Block info (latest if no height) |
| `/bitcoin info` | Full node info (version, network, size) |
| `/bitcoin health` | Health check (sync, peers, mempool) |

---

## Usage Examples

```bash
# Check sync status
/bitcoin status
# → "Bitcoin Core v30.2.0, mainnet, 100% synced (934,786 blocks)"

# Peer connectivity
/bitcoin peers
# → "10 peers connected (3 inbound, 7 outbound)"

# Mempool activity
/bitcoin mempool
# → "Mempool: 15.3 MB, 45,231 txs, median fee: 12 sat/vB"

# Latest block
/bitcoin block
# → "Block 934,786: 2,345 txs, 1.2 MB, mined 5 minutes ago"

# Health check (all-in-one)
/bitcoin health
# → ✅ Synced, ✅ 10 peers, ⚠️ Mempool high (50 MB)
```

---

## Configuration

### bitcoin.conf

Ensure RPC is enabled:

```ini
# RPC server
server=1
rpcuser=your_rpc_user
rpcpassword=your_rpc_password

# Optional: bind to localhost only (security)
rpcbind=127.0.0.1
rpcallowip=127.0.0.1

# Pruned node (optional, saves disk space)
prune=550
```

### Environment Variables

If bitcoin-cli is not in PATH or uses custom datadir:

```bash
export BITCOIN_CLI="/usr/local/bin/bitcoin-cli"
export BITCOIN_DATADIR="/home/user/.bitcoin"
```

---

## Scripts

### `scripts/node-status.sh`

Fetches blockchain sync status:
- Current block height
- Verification progress (%)
- Initial Block Download (IBD) status
- Network (mainnet/testnet/regtest)

**Output format:**
```json
{
  "blocks": 934786,
  "headers": 934786,
  "verificationprogress": 1.0,
  "ibd": false,
  "network": "main"
}
```

### `scripts/peer-info.sh`

Fetches peer connectivity:
- Total peers
- Inbound/outbound split
- Peer versions
- Connection quality

**Output format:**
```json
{
  "total": 10,
  "inbound": 3,
  "outbound": 7,
  "peers": [...]
}
```

### `scripts/mempool-stats.sh`

Fetches mempool activity:
- Size (bytes, MB)
- Transaction count
- Fee rates (min, median, max)
- Usage percentage

**Output format:**
```json
{
  "size": 15300000,
  "bytes": 15300000,
  "usage": 0.15,
  "txs": 45231,
  "minfee": 1.0,
  "medianfee": 12.0,
  "maxfee": 150.0
}
```

### `scripts/block-info.sh <height>`

Fetches block details:
- Block hash
- Timestamp
- Transaction count
- Size
- Miner (if parseable)

**Output format:**
```json
{
  "height": 934786,
  "hash": "00000000000000000002a7c4c1e48d76c5a37902165a270156b7a8d72728a054",
  "time": 1738584340,
  "txs": 2345,
  "size": 1200000
}
```

### `scripts/health-check.sh`

All-in-one health check:
- ✅ Synced (verificationprogress > 0.999)
- ✅ Peers (>= 8 connected)
- ⚠️ Mempool (>30 MB = warning, >50 MB = critical)
- ✅ Responsive (bitcoin-cli responds in <5s)

**Output format:**
```json
{
  "status": "healthy",
  "issues": [],
  "checks": {
    "synced": true,
    "peers": true,
    "mempool": "warning",
    "responsive": true
  }
}
```

---

## Integration with Heartbeat

Add to `HEARTBEAT.md`:

```markdown
### Bitcoin Node Health (daily check)
- Run: `./skills/bitcoin-node-monitor/scripts/health-check.sh`
- If issues → alert Daniel
- Log sync progress to memory/bitcoin-node-sync.log
```

---

## Alerts & Notifications

### When to Alert

| Condition | Severity | Action |
|-----------|----------|--------|
| Sync progress < 100% | Info | Report progress daily |
| Peers < 4 | Warning | Check network connectivity |
| Peers = 0 | Critical | Alert immediately |
| Mempool > 50 MB | Warning | Note high activity |
| bitcoin-cli timeout | Critical | Node may be down |

---

## Pruned Node Considerations

If running with `prune=550`:
- Can't query old blocks beyond prune window
- `getblock` fails for pruned heights
- Use `getblockheader` instead (metadata only)

**Detection:**
```bash
bitcoin-cli getblockchaininfo | jq -r '.pruned'
# → true/false
```

---

## Security Notes

- **RPC credentials:** Never commit `bitcoin.conf` with real passwords
- **Localhost binding:** Use `rpcbind=127.0.0.1` to prevent remote access
- **Firewall:** Bitcoin Core P2P port 8333 (mainnet) should be open, RPC port 8332 should NOT

---

## Troubleshooting

### Error: "Could not connect to the server"

**Cause:** Bitcoin Core not running or RPC not enabled

**Fix:**
```bash
# Check if bitcoind is running
ps aux | grep bitcoind

# Start bitcoind
bitcoind -daemon

# Check RPC config in ~/.bitcoin/bitcoin.conf
cat ~/.bitcoin/bitcoin.conf | grep -E '(server|rpcuser|rpcpassword)'
```

### Error: "Incorrect rpcuser or rpcpassword"

**Cause:** Credentials in `bitcoin.conf` don't match

**Fix:**
```bash
# Edit bitcoin.conf
nano ~/.bitcoin/bitcoin.conf

# Restart bitcoind
bitcoin-cli stop
sleep 5
bitcoind -daemon
```

### Slow Response Times

**Cause:** Node under heavy load (IBD, large mempool)

**Fix:**
- Wait for IBD to complete
- Increase dbcache in `bitcoin.conf`: `dbcache=2048`
- Upgrade hardware (SSD, more RAM)

---

## Credits

Built for self-sovereign Bitcoin runners who want command-line node monitoring without external dependencies.

---

## Related Skills

- **lightning** (clawd21) — Lightning Network node management
- **lndg** — LND GUI with auto-rebalancer (when LND operational)

---

**Version:** 1.0.0  
**Author:** Claudio (@ClaudioNeoIA)  
**License:** MIT
