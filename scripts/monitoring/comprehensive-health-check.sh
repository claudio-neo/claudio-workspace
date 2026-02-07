#!/bin/bash

# Comprehensive Health Check Script
# Created: 2026-02-07 Nightshift
# Purpose: Single command to check ALL infrastructure status

set -euo pipefail

TIMESTAMP=$(date -u +"%Y-%m-%d %H:%M:%S UTC")
BITCOIN_CLI="/home/neo/bitcoin-29.2/bin/bitcoin-cli"
LNCLI="/home/neo/lnd-linux-amd64-v0.20.0-beta/lncli --lnddir=/home/neo/.lnd --network=mainnet"

echo "╔══════════════════════════════════════════════════════════════╗"
echo "║       COMPREHENSIVE HEALTH CHECK - $TIMESTAMP       ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""

# ====================
# SYSTEM RESOURCES
# ====================
echo "=== SYSTEM RESOURCES ==="
echo "Disk:"
df -h / | tail -1
echo ""
echo "Memory:"
free -h | grep Mem
echo ""
echo "Workspace:"
du -sh /home/neo/.openclaw/workspace
echo ""

# ====================
# BITCOIN NODE
# ====================
echo "=== BITCOIN NODE ==="
if $BITCOIN_CLI getblockchaininfo >/dev/null 2>&1; then
    BLOCKS=$($BITCOIN_CLI getblockchaininfo | jq -r '.blocks')
    HEADERS=$($BITCOIN_CLI getblockchaininfo | jq -r '.headers')
    PROGRESS=$($BITCOIN_CLI getblockchaininfo | jq -r '.verificationprogress')
    PROGRESS_PCT=$(echo "$PROGRESS * 100" | bc -l | xargs printf "%.2f")
    PEERS=$($BITCOIN_CLI getnetworkinfo | jq -r '.connections')
    SIZE=$($BITCOIN_CLI getblockchaininfo | jq -r '.size_on_disk')
    SIZE_GB=$(echo "scale=2; $SIZE / 1024 / 1024 / 1024" | bc)
    
    echo "✅ Bitcoin Core: RUNNING"
    echo "   Blocks: $BLOCKS / $HEADERS ($PROGRESS_PCT%)"
    echo "   Peers: $PEERS"
    echo "   Size: ${SIZE_GB}GB"
else
    echo "❌ Bitcoin Core: NOT RUNNING"
fi
echo ""

# ====================
# LIGHTNING (LND)
# ====================
echo "=== LIGHTNING NETWORK (LND) ==="
if $LNCLI getinfo >/dev/null 2>&1; then
    ALIAS=$($LNCLI getinfo | jq -r '.alias')
    PEERS_LN=$($LNCLI getinfo | jq -r '.num_peers')
    CHANNELS=$($LNCLI getinfo | jq -r '.num_active_channels')
    SYNCED=$($LNCLI getinfo | jq -r '.synced_to_chain')
    BALANCE_ONCHAIN=$($LNCLI walletbalance | jq -r '.confirmed_balance')
    
    # Get channel balances if any channels exist
    if [ "$CHANNELS" -gt 0 ]; then
        BALANCE_LOCAL=$($LNCLI listchannels | jq '[.channels[].local_balance | tonumber] | add')
    else
        BALANCE_LOCAL=0
    fi
    
    echo "✅ LND: RUNNING"
    echo "   Alias: $ALIAS"
    echo "   Peers: $PEERS_LN"
    echo "   Channels: $CHANNELS active"
    echo "   Synced: $SYNCED"
    echo "   Balance (onchain): $BALANCE_ONCHAIN sats"
    echo "   Balance (local): $BALANCE_LOCAL sats"
else
    echo "❌ LND: NOT RUNNING"
fi
echo ""

# ====================
# SERVICES
# ====================
echo "=== SERVICES ==="

# Lightning Bot (systemd user)
if systemctl --user is-active lightning-bot.service >/dev/null 2>&1; then
    UPTIME=$(systemctl --user status lightning-bot.service | grep "Active:" | awk '{print $3, $4, $5, $6}')
    echo "✅ Lightning Bot: RUNNING ($UPTIME)"
else
    echo "❌ Lightning Bot: NOT RUNNING"
fi

# Nostr Relay (strfry)
if pgrep -f "strfry relay" >/dev/null; then
    echo "✅ Nostr Relay (strfry): RUNNING"
else
    echo "❌ Nostr Relay (strfry): NOT RUNNING"
fi

# Caddy
if pgrep -f "caddy run" >/dev/null; then
    echo "✅ Caddy (HTTPS): RUNNING"
else
    echo "❌ Caddy (HTTPS): NOT RUNNING"
fi

# LNbits (check if responding)
if curl -s http://localhost:5000 >/dev/null 2>&1; then
    echo "✅ LNbits: RESPONDING"
else
    echo "⚠️  LNbits: NOT RESPONDING (or not installed)"
fi

echo ""

# ====================
# OPENCLAW
# ====================
echo "=== OPENCLAW ==="
OPENCLAW_VERSION=$(openclaw status 2>/dev/null | grep "Version:" | awk '{print $2}' || echo "unknown")
OPENCLAW_RUNNING=$(pgrep -f "openclaw gateway" >/dev/null && echo "✅ RUNNING" || echo "❌ NOT RUNNING")
echo "Version: $OPENCLAW_VERSION"
echo "Gateway: $OPENCLAW_RUNNING"
echo ""

# ====================
# CRON JOBS
# ====================
echo "=== CRON JOBS ==="
NIGHTSHIFT_NEXT=$(openclaw cron list --json 2>/dev/null | jq -r '.jobs[] | select(.name == "nightshift") | .nextRunAt' || echo "unknown")
BACKUP_NEXT=$(openclaw cron list --json 2>/dev/null | jq -r '.jobs[] | select(.name | contains("conversation")) | .nextRunAt' || echo "unknown")

if [ "$NIGHTSHIFT_NEXT" != "unknown" ]; then
    echo "✅ Nightshift cron: Next run at $NIGHTSHIFT_NEXT"
else
    echo "⚠️  Nightshift cron: Status unknown"
fi

if [ "$BACKUP_NEXT" != "unknown" ]; then
    echo "✅ Conversation backup: Next run at $BACKUP_NEXT"
else
    echo "⚠️  Conversation backup: Status unknown"
fi
echo ""

# ====================
# ALERTS
# ====================
echo "=== ALERTS ==="

# Check disk usage
DISK_USAGE=$(df / | tail -1 | awk '{print $5}' | tr -d '%')
if [ "$DISK_USAGE" -gt 80 ]; then
    echo "⚠️  Disk usage HIGH: ${DISK_USAGE}%"
elif [ "$DISK_USAGE" -gt 90 ]; then
    echo "🔴 Disk usage CRITICAL: ${DISK_USAGE}%"
else
    echo "✅ Disk usage OK: ${DISK_USAGE}%"
fi

# Check workspace size
WORKSPACE_SIZE=$(du -sm /home/neo/.openclaw/workspace | awk '{print $1}')
if [ "$WORKSPACE_SIZE" -gt 5000 ]; then
    echo "⚠️  Workspace size HIGH: ${WORKSPACE_SIZE}MB / 10GB limit"
elif [ "$WORKSPACE_SIZE" -gt 8000 ]; then
    echo "🔴 Workspace size CRITICAL: ${WORKSPACE_SIZE}MB / 10GB limit"
else
    echo "✅ Workspace size OK: ${WORKSPACE_SIZE}MB / 10GB limit"
fi

# Check memory
MEM_USAGE=$(free | grep Mem | awk '{printf "%.0f", ($3/$2) * 100}')
if [ "$MEM_USAGE" -gt 90 ]; then
    echo "⚠️  Memory usage HIGH: ${MEM_USAGE}%"
else
    echo "✅ Memory usage OK: ${MEM_USAGE}%"
fi

echo ""
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║                    CHECK COMPLETE                            ║"
echo "╚══════════════════════════════════════════════════════════════╝"
