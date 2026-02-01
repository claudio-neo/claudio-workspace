#!/bin/bash
# Unified System Health Check
# Usage: ./health-check.sh [--json]

echo "=== System Health $(date -u '+%Y-%m-%d %H:%M UTC') ==="

# Disk
DISK_USED=$(df -h / | tail -1 | awk '{print $3}')
DISK_TOTAL=$(df -h / | tail -1 | awk '{print $2}')
DISK_PCT=$(df -h / | tail -1 | awk '{print $5}')
echo "Disk: $DISK_USED / $DISK_TOTAL ($DISK_PCT)"

# RAM
RAM_USED=$(free -h | grep Mem | awk '{print $3}')
RAM_TOTAL=$(free -h | grep Mem | awk '{print $2}')
RAM_AVAIL=$(free -h | grep Mem | awk '{print $7}')
echo "RAM: $RAM_USED / $RAM_TOTAL (available: $RAM_AVAIL)"

# CPU load
LOAD=$(uptime | awk -F'load average:' '{print $2}' | xargs)
echo "Load: $LOAD"

# Bitcoin node
CLI="/home/neo/bitcoin-29.2/bin/bitcoin-cli"
if $CLI getblockchaininfo &>/dev/null; then
  BLOCKS=$($CLI getblockchaininfo | grep -o '"blocks": [0-9]*' | grep -o '[0-9]*')
  HEADERS=$($CLI getblockchaininfo | grep -o '"headers": [0-9]*' | grep -o '[0-9]*')
  PROGRESS=$($CLI getblockchaininfo | grep -o '"verificationprogress": [0-9.]*' | grep -o '[0-9.]*')
  IBD=$($CLI getblockchaininfo | grep -o '"initialblockdownload": [a-z]*' | grep -o '[a-z]*$')
  PCT=$(echo "$PROGRESS" | awk '{printf "%.2f", $1 * 100}')
  if [ "$IBD" = "false" ]; then
    echo "Bitcoin: ✅ Synced ($BLOCKS blocks)"
  else
    echo "Bitcoin: ⏳ IBD ${PCT}% ($BLOCKS/$HEADERS)"
  fi
else
  echo "Bitcoin: ❌ Not responding"
fi

# LND
if /home/neo/lnd-linux-amd64-v0.20.0-beta/lncli getinfo &>/dev/null; then
  ALIAS=$(/home/neo/lnd-linux-amd64-v0.20.0-beta/lncli getinfo | grep -o '"alias": "[^"]*"' | cut -d'"' -f4)
  SYNCED=$(/home/neo/lnd-linux-amd64-v0.20.0-beta/lncli getinfo | grep synced_to_chain | grep -o 'true\|false')
  echo "LND: ✅ Running ($ALIAS, synced: $SYNCED)"
else
  echo "LND: ⏸️ Not running"
fi

# OpenClaw
if pgrep -f "openclaw" >/dev/null; then
  echo "OpenClaw: ✅ Running"
else
  echo "OpenClaw: ❌ Not detected"
fi

# Top processes by memory
echo ""
echo "Top RAM consumers:"
ps aux --sort=-%mem | head -6 | tail -5 | awk '{printf "  %-20s %s%%\n", $11, $4}'
