#!/bin/bash
# Bitcoin Node Status — comprehensive check
# Usage: ./scripts/bitcoin/node-status.sh [--json]

CLI="/home/neo/bitcoin-29.2/bin/bitcoin-cli"

if ! $CLI getblockchaininfo &>/dev/null; then
  echo "❌ Bitcoin node not responding"
  exit 1
fi

CHAIN=$($CLI getblockchaininfo 2>/dev/null)
NET=$($CLI getnetworkinfo 2>/dev/null)
MEM=$($CLI getmempoolinfo 2>/dev/null)

BLOCKS=$(echo "$CHAIN" | grep -o '"blocks": [0-9]*' | grep -o '[0-9]*')
HEADERS=$(echo "$CHAIN" | grep -o '"headers": [0-9]*' | grep -o '[0-9]*')
PROGRESS=$(echo "$CHAIN" | grep -o '"verificationprogress": [0-9.]*' | grep -o '[0-9.]*')
IBD=$(echo "$CHAIN" | grep -o '"initialblockdownload": [a-z]*' | grep -o '[a-z]*$')
DISK=$(echo "$CHAIN" | grep -o '"size_on_disk": [0-9]*' | grep -o '[0-9]*')
CONNS=$(echo "$NET" | grep -o '"connections": [0-9]*' | head -1 | grep -o '[0-9]*')
CONNS_IN=$(echo "$NET" | grep -o '"connections_in": [0-9]*' | grep -o '[0-9]*')
CONNS_OUT=$(echo "$NET" | grep -o '"connections_out": [0-9]*' | grep -o '[0-9]*')
MEMPOOL=$(echo "$MEM" | grep -o '"size": [0-9]*' | grep -o '[0-9]*')
VERSION=$(echo "$NET" | grep -o '"subversion": "[^"]*"' | cut -d'"' -f4)

PCT=$(echo "$PROGRESS" | awk '{printf "%.2f", $1 * 100}')
DISK_MB=$(echo "$DISK" | awk '{printf "%.0f", $1 / 1048576}')
REMAINING=$((HEADERS - BLOCKS))

if [ "$1" = "--json" ]; then
  cat << EOF
{
  "blocks": $BLOCKS,
  "headers": $HEADERS,
  "remaining": $REMAINING,
  "progress": $PCT,
  "ibd": $IBD,
  "diskMB": $DISK_MB,
  "connections": $CONNS,
  "connectionsIn": $CONNS_IN,
  "connectionsOut": $CONNS_OUT,
  "mempool": $MEMPOOL,
  "version": "$VERSION",
  "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)"
}
EOF
else
  echo "=== Bitcoin Node Status ==="
  echo "Version: $VERSION"
  echo "Blocks: $BLOCKS / $HEADERS ($PCT%)"
  echo "Remaining: $REMAINING blocks"
  echo "IBD: $IBD"
  echo "Disk: ${DISK_MB}MB"
  echo "Connections: $CONNS (in: $CONNS_IN, out: $CONNS_OUT)"
  echo "Mempool: $MEMPOOL txns"
  
  if [ "$IBD" = "true" ]; then
    # Estimate time remaining (rough: ~5000 blocks/hour based on recent rate)
    if [ $REMAINING -gt 0 ]; then
      HOURS=$(echo "$REMAINING" | awk '{printf "%.1f", $1 / 5000}')
      echo "ETA: ~${HOURS}h"
    fi
  else
    echo "✅ Fully synced!"
  fi
fi
