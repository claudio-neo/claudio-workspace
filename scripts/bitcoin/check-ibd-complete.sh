#!/bin/bash
# Check if IBD is complete and write a flag file + notify
# Intended to be checked by heartbeat

CLI="/home/neo/bitcoin-29.2/bin/bitcoin-cli"
FLAG="/home/neo/.openclaw/workspace/ibd-complete.flag"
STATE_FILE="/home/neo/.openclaw/workspace/memory/heartbeat-state.json"

IBD=$($CLI getblockchaininfo 2>/dev/null | grep -o '"initialblockdownload": [a-z]*' | grep -o '[a-z]*$')

if [ "$IBD" = "false" ] && [ ! -f "$FLAG" ]; then
  # IBD just completed!
  BLOCKS=$($CLI getblockchaininfo | grep -o '"blocks": [0-9]*' | grep -o '[0-9]*')
  HEADERS=$($CLI getblockchaininfo | grep -o '"headers": [0-9]*' | grep -o '[0-9]*')
  
  echo "IBD completed at $(date -u +%Y-%m-%dT%H:%M:%SZ)" > "$FLAG"
  echo "Blocks: $BLOCKS / $HEADERS" >> "$FLAG"
  
  echo "🎉 IBD COMPLETE! Blocks: $BLOCKS/$HEADERS"
  echo "Next steps:"
  echo "  1. Reduce dbcache: edit ~/.bitcoin/bitcoin.conf (2048 → 512)"
  echo "  2. Restart bitcoind"
  echo "  3. Start LND: /home/neo/lnd-linux-amd64-v0.20.0-beta/lnd"
  echo "  4. Create wallet: lncli create"
  exit 0
elif [ "$IBD" = "false" ]; then
  echo "IBD already completed (flag exists)"
  exit 0
else
  PROGRESS=$($CLI getblockchaininfo | grep -o '"verificationprogress": [0-9.]*' | grep -o '[0-9.]*')
  PCT=$(echo "$PROGRESS" | awk '{printf "%.2f", $1 * 100}')
  echo "IBD in progress: ${PCT}%"
  exit 1
fi
