#!/bin/bash
# Quick Status - One-line summary of all systems
# Usage: ./quick-status.sh

set -euo pipefail

# Colors
G='\033[0;32m' # Green
Y='\033[1;33m' # Yellow
R='\033[0;31m' # Red
NC='\033[0m'   # No Color

# Helper function for status icon
status_icon() {
    if [ "$1" = "ok" ]; then
        echo -e "${G}✓${NC}"
    elif [ "$1" = "warn" ]; then
        echo -e "${Y}⚠${NC}"
    else
        echo -e "${R}✗${NC}"
    fi
}

# Bitcoin
BITCOIN_CLI=$(find /home/neo/bitcoin* -name bitcoin-cli -type f 2>/dev/null | head -1)
if [ -n "$BITCOIN_CLI" ] && BLOCKS=$($BITCOIN_CLI getblockcount 2>/dev/null); then
    BTC_STATUS="ok"
    BTC_TEXT="$BLOCKS blocks"
else
    BTC_STATUS="err"
    BTC_TEXT="down"
fi

# LND
LND_CLI=$(find /home/neo -name lncli -type f 2>/dev/null | head -1)
if [ -n "$LND_CLI" ] && LND_INFO=$($LND_CLI getinfo 2>/dev/null); then
    LND_SYNCED=$(echo "$LND_INFO" | jq -r '.synced_to_chain')
    LND_CHANNELS=$(echo "$LND_INFO" | jq -r '.num_active_channels')
    if [ "$LND_SYNCED" = "true" ]; then
        LND_STATUS="ok"
        LND_TEXT="${LND_CHANNELS}ch"
    else
        LND_STATUS="warn"
        LND_TEXT="sync"
    fi
else
    LND_STATUS="err"
    LND_TEXT="down"
fi

# Lightning Bot
if [ -f "/home/neo/lightning-telegram-bot/bot.js" ] && pgrep -f "^node bot.js$" > /dev/null; then
    BOT_USERS=$(sqlite3 /home/neo/lightning-telegram-bot/bot.db "SELECT COUNT(*) FROM users;" 2>/dev/null || echo "0")
    BOT_STATUS="ok"
    BOT_TEXT="${BOT_USERS}u"
else
    BOT_STATUS="err"
    BOT_TEXT="down"
fi

# Nostr Relay
if docker ps --format '{{.Names}}' | grep -q strfry-relay; then
    NOSTR_STATUS="ok"
    NOSTR_TEXT="up"
else
    NOSTR_STATUS="err"
    NOSTR_TEXT="down"
fi

# OpenClaw Gateway
if pgrep -f openclaw-gateway > /dev/null; then
    GW_STATUS="ok"
    GW_TEXT="up"
else
    GW_STATUS="err"
    GW_TEXT="down"
fi

# Disk
DISK_USAGE=$(df -h /home/neo | awk 'NR==2 {print $5}' | tr -d '%')
if [ "$DISK_USAGE" -ge 90 ]; then
    DISK_STATUS="err"
elif [ "$DISK_USAGE" -ge 80 ]; then
    DISK_STATUS="warn"
else
    DISK_STATUS="ok"
fi
DISK_TEXT="${DISK_USAGE}%"

# Workspace
WORKSPACE_GB=$(du -s /home/neo/.openclaw/workspace 2>/dev/null | awk '{print $1/1024/1024}')
WORKSPACE_PERCENT=$(echo "$WORKSPACE_GB / 10 * 100" | bc -l | cut -d. -f1)
if [ "$WORKSPACE_PERCENT" -ge 90 ]; then
    WS_STATUS="err"
elif [ "$WORKSPACE_PERCENT" -ge 80 ]; then
    WS_STATUS="warn"
else
    WS_STATUS="ok"
fi
WS_TEXT="${WORKSPACE_PERCENT}%"

# Print compact status line
echo -n "$(date -u '+%H:%M UTC') | "
echo -n "BTC:$(status_icon $BTC_STATUS)$BTC_TEXT "
echo -n "LND:$(status_icon $LND_STATUS)$LND_TEXT "
echo -n "Bot:$(status_icon $BOT_STATUS)$BOT_TEXT "
echo -n "Nostr:$(status_icon $NOSTR_STATUS)$NOSTR_TEXT "
echo -n "GW:$(status_icon $GW_STATUS)$GW_TEXT "
echo -n "Disk:$(status_icon $DISK_STATUS)$DISK_TEXT "
echo "WS:$(status_icon $WS_STATUS)$WS_TEXT"
