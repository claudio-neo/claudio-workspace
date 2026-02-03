#!/usr/bin/env bash
# block-info.sh <height> — Fetch block details (latest if no height)

set -euo pipefail

BITCOIN_CLI="${BITCOIN_CLI:-bitcoin-cli}"

# Get block height (arg or latest)
if [ $# -eq 0 ]; then
  height=$($BITCOIN_CLI getblockcount)
else
  height=$1
fi

# Get block hash
hash=$($BITCOIN_CLI getblockhash "$height")

# Get block info (may fail if pruned)
if block=$($BITCOIN_CLI getblock "$hash" 1 2>/dev/null); then
  # Full block data
  time=$(echo "$block" | jq -r '.time')
  txs=$(echo "$block" | jq -r '.nTx')
  size=$(echo "$block" | jq -r '.size')
  weight=$(echo "$block" | jq -r '.weight')
  
  # Calculate age
  now=$(date +%s)
  age=$((now - time))
  
  # Output JSON
  jq -n \
    --argjson height "$height" \
    --arg hash "$hash" \
    --argjson time "$time" \
    --argjson txs "$txs" \
    --argjson size "$size" \
    --argjson weight "$weight" \
    --argjson age "$age" \
    '{
      height: $height,
      hash: $hash,
      time: $time,
      txs: $txs,
      size: $size,
      weight: $weight,
      age_seconds: $age
    }'
else
  # Pruned node, use header only
  header=$($BITCOIN_CLI getblockheader "$hash")
  time=$(echo "$header" | jq -r '.time')
  
  now=$(date +%s)
  age=$((now - time))
  
  jq -n \
    --argjson height "$height" \
    --arg hash "$hash" \
    --argjson time "$time" \
    --argjson age "$age" \
    '{
      height: $height,
      hash: $hash,
      time: $time,
      pruned: true,
      age_seconds: $age
    }'
fi
