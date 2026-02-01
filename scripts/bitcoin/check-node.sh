#!/bin/bash
# Bitcoin Node Status Checker
# Usage: ./check-node.sh [json|human]
# Always runs commands in real-time (NEVER from cache/memory)

BITCOIN_CLI="/home/neo/bitcoin-30.2/bin/bitcoin-cli"
DATADIR="/home/neo/.bitcoin"
FORMAT="${1:-human}"

# Get blockchain info
INFO=$($BITCOIN_CLI -datadir=$DATADIR getblockchaininfo 2>&1)

if [ $? -ne 0 ]; then
    echo "ERROR: bitcoin-cli failed: $INFO"
    exit 1
fi

BLOCKS=$(echo "$INFO" | grep '"blocks"' | grep -o '[0-9]*')
HEADERS=$(echo "$INFO" | grep '"headers"' | grep -o '[0-9]*')
PROGRESS=$(echo "$INFO" | grep '"verificationprogress"' | grep -o '0\.[0-9]*')
IBD=$(echo "$INFO" | grep '"initialblockdownload"' | grep -o 'true\|false')
SIZE=$(echo "$INFO" | grep '"size_on_disk"' | grep -o '[0-9]*')
PRUNED=$(echo "$INFO" | grep '"pruned"' | grep -o 'true\|false')

# Calculate percentage
PCT=$(python3 -c "print(f'{float(\"$PROGRESS\")*100:.2f}')" 2>/dev/null || echo "?")

# Get peer info
PEERS=$($BITCOIN_CLI -datadir=$DATADIR getconnectioncount 2>/dev/null || echo "?")

# Get network info
NETINFO=$($BITCOIN_CLI -datadir=$DATADIR getnetworkinfo 2>/dev/null)
VERSION=$(echo "$NETINFO" | grep '"subversion"' | grep -o '"[^"]*"' | tr -d '"')

# Disk size in GB
SIZE_GB=$(python3 -c "print(f'{int(\"$SIZE\")/1024/1024/1024:.2f}')" 2>/dev/null || echo "?")

# Timestamp
NOW=$(date -u '+%Y-%m-%d %H:%M:%S UTC')

if [ "$FORMAT" = "json" ]; then
    cat << ENDJSON
{
  "timestamp": "$NOW",
  "blocks": $BLOCKS,
  "headers": $HEADERS,
  "progress_pct": $PCT,
  "ibd": $IBD,
  "pruned": $PRUNED,
  "size_gb": $SIZE_GB,
  "peers": $PEERS,
  "version": "$VERSION"
}
ENDJSON
else
    echo "=== Bitcoin Node Status ==="
    echo "Timestamp: $NOW"
    echo "Version: $VERSION"
    echo "Blocks: $BLOCKS / $HEADERS"
    echo "Progress: ${PCT}%"
    echo "IBD: $IBD"
    echo "Pruned: $PRUNED"
    echo "Disk: ${SIZE_GB} GB"
    echo "Peers: $PEERS"
    echo "=========================="
fi
