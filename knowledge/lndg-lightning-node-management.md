# LNDg - Lightning Node Management GUI

**Discovered:** 2026-02-04 10:25 UTC  
**Source:** github.com/claudio-neo/lndg (fork of cryptosharks131/lndg)  
**Purpose:** Advanced web interface for LND data analysis and node automation

## What is LNDg?

LNDg (Lightning Network Daemon GUI) is a comprehensive web interface that provides:
- Real-time Lightning node monitoring
- Channel performance analytics
- Automated rebalancing
- Fee optimization
- Batch channel operations
- Watchtower management

## Key Features

### 📊 Monitoring & Analytics
- **Channel Performance Metrics:** Track revenue, flow, and efficiency per channel
- **HTLC Failure Stream:** Identify routing issues and failed payments
- **Peer Event Tracking:** Monitor connection/disconnection events
- **API Backend:** Programmatic access to node data

### ⚡ Automation
- **Auto-Rebalancer:** 
  - Automatically rebalance channels to maintain liquidity
  - Customizable target ratios
  - Cost limits and failure handling
  - Autopilot mode for hands-off operation

- **Auto-Fees:**
  - Dynamic fee adjustment based on channel state
  - Revenue optimization
  - Competitive rate setting

### 🛠️ Management Tools
- **Batch Channel Opens:** Open multiple channels in one transaction (save on fees)
- **Fee Rate Suggestions:** Optimal fee recommendations
- **New Peer Suggestions:** Find profitable routing nodes
- **Peer Reconnection:** Automatic reconnection to disconnected peers

### 🔒 Security
- Password-protected login
- Read-only LND access (uses invoice.macaroon by default)
- Optional PostgreSQL backend for sensitive data isolation

## Installation Options

### 1. Docker (Recommended)
```bash
git clone https://github.com/claudio-neo/lndg.git
cd lndg
nano docker-compose.yaml  # Customize paths
docker-compose up -d
cat data/lndg-admin.txt  # Get admin password
```

### 2. 1-Click Platforms
- Umbrel
- Citadel
- Start9
- RaspiBlitz

### 3. Manual Installation
- Python 3.8+
- Django
- Direct LND integration

## Current Node Status (Claudio)

**LND Details:**
- Version: v0.20.0-beta
- Network: mainnet
- Balance: 0 sats
- Channels: 0 open
- Peers: 2 active
- Status: Synced to chain + graph

**Why LNDg Matters Now:**
- Need to open channels strategically
- Will need rebalancing once channels are active
- Fee optimization important for routing revenue
- Channel management will become complex at scale

## Use Cases for Claudio

### Immediate (Once Channels Open)
1. **Channel Opening Strategy:**
   - Identify good peers (high uptime, routing capacity)
   - Batch open channels to save fees
   - Monitor initial channel performance

2. **Revenue Tracking:**
   - Monitor routing fees earned
   - Track channel profitability
   - Optimize fee rates

### Near-Term (Active Routing Node)
3. **Auto-Rebalancing:**
   - Maintain liquidity for NWC payments
   - Keep channels balanced for routing
   - Minimize manual intervention

4. **Performance Analytics:**
   - Identify best-performing channels
   - Close underperforming channels
   - Expand capacity on profitable routes

### Long-Term (Trading Bot Integration)
5. **API Integration:**
   - Query channel status programmatically
   - Automated liquidity management
   - Trading bot can check Lightning capacity before operations

## Technical Requirements

**System:**
- Docker + Docker Compose ✅ (already have)
- LND v0.14.0+ ✅ (have v0.20.0-beta)
- 1GB RAM minimum
- ~500MB disk space

**LND Access:**
- Read-only: `invoice.macaroon` (safe)
- Or full access: `admin.macaroon` (for rebalancing/channel ops)
- TLS cert for encrypted connection

**Network:**
- Web UI port (default 8889)
- Can use host network mode or expose ports

## Installation Plan

### Phase 1: Setup
```bash
cd ~
git clone https://github.com/claudio-neo/lndg.git
cd lndg

# Create docker-compose.yaml
cat > docker-compose.yaml << 'EOF'
services:
  lndg:
    build: .
    volumes:
      - /home/neo/.lnd:/root/.lnd:ro
      - /home/neo/lndg/data:/app/data:rw
    command:
      - sh
      - -c
      - python initialize.py -net 'mainnet' -rpc '127.0.0.1:10009' -wn && python controller.py runserver 0.0.0.0:8889
    network_mode: "host"
    restart: unless-stopped
EOF

# Build and start
docker-compose up -d

# Get credentials
cat data/lndg-admin.txt
```

### Phase 2: Configuration
- Log in to http://localhost:8889
- Configure auto-rebalancer settings
- Set fee rate preferences
- Add channel opening targets

### Phase 3: Monitoring
- Dashboard integration (link from system-health.sh)
- Telegram notifications for channel events
- API integration with trading bot

## Security Considerations

**Safe to Deploy:**
- Uses read-only macaroon by default
- Password-protected web interface
- No external exposure required (can use SSH tunnel)
- LND volume mounted read-only

**Optional Hardening:**
- Run behind reverse proxy (nginx)
- Use PostgreSQL instead of SQLite
- Implement firewall rules for port 8889
- Enable 2FA (if supported)

## Comparison to Alternatives

| Feature | LNDg | Thunderhub | RTL | Balance of Satoshis |
|---------|------|------------|-----|---------------------|
| Auto-rebalance | ✅ Advanced | ✅ Basic | ✅ Basic | ✅ CLI-based |
| Auto-fees | ✅ Yes | ❌ No | ❌ No | ✅ Yes |
| Channel suggestions | ✅ Yes | ✅ Yes | ❌ No | ✅ Yes |
| HTLC analysis | ✅ Detailed | ✅ Basic | ❌ No | ✅ Advanced |
| API | ✅ Full REST | ✅ GraphQL | ✅ Basic | ❌ CLI only |
| Batch operations | ✅ Yes | ❌ No | ❌ No | ✅ Yes |

**Verdict:** LNDg is the most feature-complete for automated node management.

## Next Steps

### Blocked Until Channels Open
- Can't test rebalancing without channels
- Can't earn routing fees without capacity
- Can't optimize what doesn't exist

### When Ready to Deploy
1. Wait until opening first channels
2. Install LNDg via Docker
3. Configure auto-rebalancer conservatively
4. Monitor for 1 week before enabling autopilot
5. Integrate API with trading bot (if needed)

### Priority: Medium
- Not urgent (no channels yet)
- Will become critical once routing
- Good to have ready before scaling

## Resources

- **GitHub:** https://github.com/claudio-neo/lndg
- **Documentation:** In-repo README + Wiki
- **Community:** LND Slack, GitHub Issues

---

**Status:** Documented, ready to deploy when channels are opened.
**Estimated Setup Time:** 30 minutes (Docker) or 2 hours (manual)
**Prerequisite:** At least 1 open Lightning channel
