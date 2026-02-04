#!/bin/bash
# System Health Check Script
# Monitors: Bitcoin node, Nostr relay, OpenClaw gateway, disk usage
# Created: 2026-02-03 09:06 UTC

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Thresholds
DISK_WARN_PERCENT=80
DISK_CRITICAL_PERCENT=90
MAX_WORKSPACE_GB=10

echo "=== SYSTEM HEALTH CHECK ==="
echo "Timestamp: $(date -u +"%Y-%m-%d %H:%M:%S UTC")"
echo ""

# ============================================
# Bitcoin Node Status
# ============================================
echo "--- Bitcoin Node ---"
BITCOIN_CLI=$(find /home/neo/bitcoin* -name bitcoin-cli -type f 2>/dev/null | head -1)
if [ -n "$BITCOIN_CLI" ] && [ -x "$BITCOIN_CLI" ]; then
    BITCOIN_INFO=$($BITCOIN_CLI getblockchaininfo 2>/dev/null || echo "ERROR")
    if [ "$BITCOIN_INFO" != "ERROR" ]; then
        BLOCKS=$(echo "$BITCOIN_INFO" | jq -r '.blocks')
        HEADERS=$(echo "$BITCOIN_INFO" | jq -r '.headers')
        PROGRESS=$(echo "$BITCOIN_INFO" | jq -r '.verificationprogress * 100' | cut -d. -f1)
        PRUNED=$(echo "$BITCOIN_INFO" | jq -r '.pruned')
        
        if [ "$BLOCKS" = "$HEADERS" ]; then
            echo -e "${GREEN}✓${NC} Synced: $BLOCKS blocks ($PROGRESS%)"
        else
            echo -e "${YELLOW}⚠${NC} Syncing: $BLOCKS/$HEADERS ($PROGRESS%)"
        fi
        echo "  Pruned: $PRUNED"
        
        PEERS=$($BITCOIN_CLI getpeerinfo 2>/dev/null | jq 'length')
        echo "  Peers: $PEERS"
    else
        echo -e "${RED}✗${NC} Bitcoin node not responding"
    fi
else
    echo -e "${YELLOW}⚠${NC} bitcoin-cli not found"
fi
echo ""

# ============================================
# Nostr Relay Status
# ============================================
echo "--- Nostr Relay ---"
if docker ps --format '{{.Names}}' | grep -q strfry-relay; then
    RELAY_STATUS=$(docker inspect strfry-relay --format='{{.State.Status}}' 2>/dev/null || echo "ERROR")
    if [ "$RELAY_STATUS" = "running" ]; then
        UPTIME=$(docker inspect strfry-relay --format='{{.State.StartedAt}}' | xargs -I {} date -d {} +%s)
        NOW=$(date +%s)
        HOURS=$(( (NOW - UPTIME) / 3600 ))
        echo -e "${GREEN}✓${NC} Running (uptime: ${HOURS}h)"
        
        # Check if port 7777 is accessible internally
        if timeout 2 curl -s http://localhost:7777 > /dev/null 2>&1; then
            echo -e "${GREEN}✓${NC} Port 7777 responding"
        else
            echo -e "${YELLOW}⚠${NC} Port 7777 not accessible (firewall?)"
        fi
    else
        echo -e "${RED}✗${NC} Container status: $RELAY_STATUS"
    fi
else
    echo -e "${RED}✗${NC} strfry-relay container not found"
fi
echo ""

# ============================================
# Lightning Network (LND + Bot)
# ============================================
echo "--- Lightning Network ---"

# Check LND
LND_CLI=$(find /home/neo -name lncli -type f 2>/dev/null | head -1)
if [ -n "$LND_CLI" ] && [ -x "$LND_CLI" ]; then
    LND_INFO=$($LND_CLI getinfo 2>/dev/null || echo "ERROR")
    if [ "$LND_INFO" != "ERROR" ]; then
        SYNCED=$(echo "$LND_INFO" | jq -r '.synced_to_chain')
        BLOCK_HEIGHT=$(echo "$LND_INFO" | jq -r '.block_height')
        NUM_PEERS=$(echo "$LND_INFO" | jq -r '.num_peers')
        NUM_CHANNELS=$(echo "$LND_INFO" | jq -r '.num_active_channels')
        
        if [ "$SYNCED" = "true" ]; then
            echo -e "${GREEN}✓${NC} LND synced (block: $BLOCK_HEIGHT, peers: $NUM_PEERS, channels: $NUM_CHANNELS)"
        else
            echo -e "${YELLOW}⚠${NC} LND not synced (block: $BLOCK_HEIGHT)"
        fi
    else
        echo -e "${RED}✗${NC} LND not responding"
    fi
else
    echo -e "${YELLOW}⚠${NC} lncli not found"
fi

# Check Lightning Telegram Bot
if [ -f "/home/neo/lightning-telegram-bot/bot.js" ]; then
    BOT_PID=$(pgrep -f "^node bot.js$" | head -1)
    if [ -n "$BOT_PID" ]; then
        # Get bot stats from database
        BOT_USERS=$(sqlite3 /home/neo/lightning-telegram-bot/bot.db "SELECT COUNT(*) FROM users;" 2>/dev/null || echo "0")
        BOT_BALANCE=$(sqlite3 /home/neo/lightning-telegram-bot/bot.db "SELECT COALESCE(SUM(balance_sats), 0) FROM users;" 2>/dev/null || echo "0")
        BOT_TXS=$(sqlite3 /home/neo/lightning-telegram-bot/bot.db "SELECT COUNT(*) FROM transactions;" 2>/dev/null || echo "0")
        
        echo -e "${GREEN}✓${NC} Lightning Bot running (users: $BOT_USERS, balance: $BOT_BALANCE sats, txs: $BOT_TXS)"
    else
        echo -e "${RED}✗${NC} Lightning Bot not running"
    fi
fi
echo ""

# ============================================
# OpenClaw Gateway Status
# ============================================
echo "--- OpenClaw Gateway ---"
if pgrep -f openclaw-gateway > /dev/null; then
    PID=$(pgrep -f openclaw-gateway)
    UPTIME=$(ps -p $PID -o etimes= | tr -d ' ')
    HOURS=$(( UPTIME / 3600 ))
    echo -e "${GREEN}✓${NC} Running (PID: $PID, uptime: ${HOURS}h)"
    
    # Check WebSocket port
    if ss -tuln | grep -q ':18789'; then
        echo -e "${GREEN}✓${NC} WebSocket port 18789 listening"
    else
        echo -e "${YELLOW}⚠${NC} WebSocket port not listening"
    fi
else
    echo -e "${RED}✗${NC} Gateway not running"
fi
echo ""

# ============================================
# Disk Usage
# ============================================
echo "--- Disk Usage ---"

# Overall /home/neo usage
HOME_USAGE=$(df -h /home/neo | awk 'NR==2 {print $5}' | tr -d '%')
HOME_USED=$(df -h /home/neo | awk 'NR==2 {print $3}')
HOME_AVAIL=$(df -h /home/neo | awk 'NR==2 {print $4}')

if [ "$HOME_USAGE" -ge "$DISK_CRITICAL_PERCENT" ]; then
    echo -e "${RED}✗${NC} /home/neo: ${HOME_USED}/${HOME_AVAIL} (${HOME_USAGE}% - CRITICAL)"
elif [ "$HOME_USAGE" -ge "$DISK_WARN_PERCENT" ]; then
    echo -e "${YELLOW}⚠${NC} /home/neo: ${HOME_USED}/${HOME_AVAIL} (${HOME_USAGE}% - WARNING)"
else
    echo -e "${GREEN}✓${NC} /home/neo: ${HOME_USED}/${HOME_AVAIL} (${HOME_USAGE}%)"
fi

# Workspace usage (my 10GB limit)
WORKSPACE_SIZE=$(du -sh /home/neo/.openclaw/workspace 2>/dev/null | cut -f1)
WORKSPACE_GB=$(du -s /home/neo/.openclaw/workspace 2>/dev/null | awk '{print $1/1024/1024}')
WORKSPACE_PERCENT=$(echo "$WORKSPACE_GB / $MAX_WORKSPACE_GB * 100" | bc -l | cut -d. -f1)

if [ "$WORKSPACE_PERCENT" -ge 90 ]; then
    echo -e "${RED}✗${NC} Workspace: ${WORKSPACE_SIZE} (${WORKSPACE_PERCENT}% of ${MAX_WORKSPACE_GB}GB limit - CRITICAL)"
elif [ "$WORKSPACE_PERCENT" -ge 80 ]; then
    echo -e "${YELLOW}⚠${NC} Workspace: ${WORKSPACE_SIZE} (${WORKSPACE_PERCENT}% of ${MAX_WORKSPACE_GB}GB limit - WARNING)"
else
    echo -e "${GREEN}✓${NC} Workspace: ${WORKSPACE_SIZE} (${WORKSPACE_PERCENT}% of ${MAX_WORKSPACE_GB}GB limit)"
fi

# Bitcoin data size
if [ -d "$HOME/.bitcoin" ]; then
    BITCOIN_SIZE=$(du -sh $HOME/.bitcoin 2>/dev/null | cut -f1)
    echo "  Bitcoin data: $BITCOIN_SIZE"
fi

# LND data size (if exists)
if [ -d "$HOME/.lnd" ]; then
    LND_SIZE=$(du -sh $HOME/.lnd 2>/dev/null | cut -f1)
    echo "  LND data: $LND_SIZE"
fi

echo ""

# ============================================
# Memory Usage
# ============================================
echo "--- Memory ---"
MEM_TOTAL=$(free -h | awk 'NR==2 {print $2}')
MEM_USED=$(free -h | awk 'NR==2 {print $3}')
MEM_AVAIL=$(free -h | awk 'NR==2 {print $7}')
echo "  Total: $MEM_TOTAL | Used: $MEM_USED | Available: $MEM_AVAIL"
echo ""

# ============================================
# Summary
# ============================================
echo "=== SUMMARY ==="
ISSUES=0

# Count issues
BITCOIN_CLI=$(find /home/neo/bitcoin* -name bitcoin-cli -type f 2>/dev/null | head -1)
if [ -z "$BITCOIN_CLI" ] || ! $BITCOIN_CLI getblockchaininfo &> /dev/null; then ((ISSUES++)); fi
if ! docker ps --format '{{.Names}}' | grep -q strfry-relay; then ((ISSUES++)); fi

# Check LND
LND_CLI=$(find /home/neo -name lncli -type f 2>/dev/null | head -1)
if [ -n "$LND_CLI" ]; then
    LND_INFO=$($LND_CLI getinfo 2>/dev/null || echo "ERROR")
    if [ "$LND_INFO" = "ERROR" ]; then ((ISSUES++)); fi
fi

# Check Lightning Bot
if [ -f "/home/neo/lightning-telegram-bot/bot.js" ]; then
    if ! pgrep -f "^node bot.js$" > /dev/null; then ((ISSUES++)); fi
fi

if ! pgrep -f openclaw-gateway > /dev/null; then ((ISSUES++)); fi
if [ "$HOME_USAGE" -ge "$DISK_CRITICAL_PERCENT" ]; then ((ISSUES++)); fi
if [ "$WORKSPACE_PERCENT" -ge 90 ]; then ((ISSUES++)); fi

if [ "$ISSUES" -eq 0 ]; then
    echo -e "${GREEN}✓ All systems operational${NC}"
    exit 0
else
    echo -e "${YELLOW}⚠ $ISSUES issue(s) detected${NC}"
    exit 1
fi
