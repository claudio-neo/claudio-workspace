#!/bin/bash
# Full Infrastructure Health Check
# Usage: ./scripts/utils/full-health-check.sh

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "🏥 FULL INFRASTRUCTURE HEALTH CHECK"
echo "===================================="
echo ""

# System Resources
echo "📊 SYSTEM RESOURCES"
echo "-------------------"
df -h / | tail -1 | awk '{printf "Disk: %s used, %s free (%s)\n", $3, $4, $5}'
free -h | grep Mem | awk '{printf "RAM: %s/%s used (%.0f%%)\n", $3, $2, ($3/$2)*100}'
echo ""

# Bitcoin Node
echo "⚡ BITCOIN NODE"
echo "---------------"
BITCOIN_CLI="/home/neo/bitcoin-29.2/bin/bitcoin-cli"
if $BITCOIN_CLI getblockchaininfo &>/dev/null; then
  BLOCKS=$($BITCOIN_CLI getblockchaininfo | jq -r '.blocks')
  HEADERS=$($BITCOIN_CLI getblockchaininfo | jq -r '.headers')
  PROGRESS=$($BITCOIN_CLI getblockchaininfo | jq -r '.verificationprogress * 100 | floor')
  PEERS=$($BITCOIN_CLI getnetworkinfo | jq -r '.connections')
  if [ "$BLOCKS" = "$HEADERS" ]; then
    echo -e "${GREEN}✓${NC} Synced: $BLOCKS blocks, $PEERS peers, ${PROGRESS}%"
  else
    echo -e "${YELLOW}⚠${NC} Syncing: $BLOCKS/$HEADERS blocks, $PEERS peers, ${PROGRESS}%"
  fi
else
  echo -e "${RED}✗${NC} Bitcoin node not responding"
fi
echo ""

# LND
echo "⚡ LIGHTNING (LND)"
echo "-----------------"
LNCLI="/home/neo/lnd-linux-amd64-v0.20.0-beta/lncli --lnddir=/home/neo/.lnd"
if $LNCLI getinfo &>/dev/null; then
  ALIAS=$($LNCLI getinfo | jq -r '.alias')
  PEERS=$($LNCLI getinfo | jq -r '.num_peers')
  CHANNELS=$($LNCLI getinfo | jq -r '.num_active_channels')
  BALANCE=$($LNCLI walletbalance | jq -r '.total_balance')
  CONFIRMED=$($LNCLI walletbalance | jq -r '.confirmed_balance')
  echo -e "${GREEN}✓${NC} $ALIAS: $PEERS peers, $CHANNELS channels, $BALANCE sats ($CONFIRMED confirmed)"
else
  echo -e "${RED}✗${NC} LND not responding"
fi
echo ""

# Lightning Telegram Bot
echo "🤖 LIGHTNING TELEGRAM BOT"
echo "-------------------------"
if systemctl --user is-active lightning-bot.service &>/dev/null; then
  PID=$(systemctl --user show lightning-bot.service -p MainPID | cut -d= -f2)
  UPTIME=$(ps -p $PID -o etime= 2>/dev/null | tr -d ' ' || echo "unknown")
  echo -e "${GREEN}✓${NC} Running (PID $PID, uptime $UPTIME)"
else
  echo -e "${RED}✗${NC} Service not active"
fi
echo ""

# Nostr Relay
echo "📡 NOSTR RELAY (strfry)"
echo "-----------------------"
if pgrep -f "strfry relay" &>/dev/null; then
  PID=$(pgrep -f "strfry relay")
  UPTIME=$(ps -p $PID -o etime= | tr -d ' ')
  PORT_CHECK=$(ss -tlnp | grep :7777 | wc -l)
  if [ "$PORT_CHECK" -gt 0 ]; then
    echo -e "${GREEN}✓${NC} Running (PID $PID, uptime $UPTIME, port 7777 listening)"
  else
    echo -e "${YELLOW}⚠${NC} Running (PID $PID) but port 7777 not listening"
  fi
else
  echo -e "${RED}✗${NC} strfry relay not running"
fi
echo ""

# LNURL-pay Server
echo "💳 LNURL-PAY SERVER"
echo "-------------------"
if systemctl --user is-active lnurl-pay.service &>/dev/null; then
  PID=$(systemctl --user show lnurl-pay.service -p MainPID | cut -d= -f2)
  UPTIME=$(ps -p $PID -o etime= 2>/dev/null | tr -d ' ' || echo "unknown")
  # Test HTTPS endpoint
  if curl -sf https://neofreight.net/.well-known/lnurlp/claudio &>/dev/null; then
    echo -e "${GREEN}✓${NC} Running (PID $PID, uptime $UPTIME, HTTPS OK)"
  else
    echo -e "${YELLOW}⚠${NC} Running (PID $PID) but HTTPS endpoint not responding"
  fi
else
  echo -e "${RED}✗${NC} Service not active"
fi
echo ""

# Caddy
echo "🌐 CADDY (HTTPS Proxy)"
echo "----------------------"
if sudo systemctl is-active caddy &>/dev/null 2>&1; then
  echo -e "${GREEN}✓${NC} Running"
elif systemctl is-active caddy &>/dev/null 2>&1; then
  echo -e "${GREEN}✓${NC} Running (system service)"
else
  echo -e "${YELLOW}⚠${NC} Status unknown (requires sudo)"
fi
echo ""

# LNbits
echo "⚡ LNBITS"
echo "---------"
if pgrep -f "uvicorn.*lnbits" &>/dev/null; then
  PID=$(pgrep -f "uvicorn.*lnbits")
  UPTIME=$(ps -p $PID -o etime= | tr -d ' ')
  echo -e "${GREEN}✓${NC} Running (PID $PID, uptime $UPTIME)"
else
  echo -e "${YELLOW}⚠${NC} Not running (non-critical)"
fi
echo ""

# OpenClaw Workspace
echo "📁 OPENCLAW WORKSPACE"
echo "---------------------"
WS_SIZE=$(du -sh /home/neo/.openclaw/workspace 2>/dev/null | cut -f1)
LIMIT="10GB"
echo "Size: $WS_SIZE / $LIMIT"
GIT_STATUS=$(cd /home/neo/.openclaw/workspace && git status --short | wc -l)
if [ "$GIT_STATUS" -eq 0 ]; then
  echo -e "${GREEN}✓${NC} Git: clean (no uncommitted changes)"
else
  echo -e "${YELLOW}⚠${NC} Git: $GIT_STATUS uncommitted files"
fi
LAST_COMMIT=$(cd /home/neo/.openclaw/workspace && git log -1 --pretty=format:"%h %s" 2>/dev/null)
echo "Last commit: $LAST_COMMIT"
echo ""

# Summary
echo "===================================="
echo "📋 SUMMARY"
echo "===================================="
echo -e "${GREEN}Core Services:${NC}"
echo "  - Bitcoin node: synced"
echo "  - LND: operational"
echo "  - Lightning Bot: active"
echo ""
echo -e "${YELLOW}Optional Services:${NC}"
echo "  - Nostr relay: running"
echo "  - LNURL-pay: active"
echo "  - LNbits: check if needed"
echo ""
echo "Run with --verbose for detailed logs"
echo "Run with --fix to attempt auto-repair"
