#!/usr/bin/env bash
# node-status.sh — Fetch Bitcoin Core blockchain sync status

set -euo pipefail

# Use custom bitcoin-cli if env var set
BITCOIN_CLI="${BITCOIN_CLI:-bitcoin-cli}"

# Fetch blockchain info
info=$($BITCOIN_CLI getblockchaininfo)

# Extract key fields
blocks=$(echo "$info" | jq -r '.blocks')
headers=$(echo "$info" | jq -r '.headers')
verification=$(echo "$info" | jq -r '.verificationprogress')
ibd=$(echo "$info" | jq -r '.initialblockdownload')
chain=$(echo "$info" | jq -r '.chain')
pruned=$(echo "$info" | jq -r '.pruned')
size_on_disk=$(echo "$info" | jq -r '.size_on_disk')

# Calculate percentage
percent=$(echo "$verification * 100" | bc -l | xargs printf "%.2f")

# Output JSON
jq -n \
  --argjson blocks "$blocks" \
  --argjson headers "$headers" \
  --argjson verification "$verification" \
  --argjson ibd "$ibd" \
  --arg chain "$chain" \
  --argjson pruned "$pruned" \
  --argjson size_on_disk "$size_on_disk" \
  --arg percent "$percent" \
  '{
    blocks: $blocks,
    headers: $headers,
    verificationprogress: $verification,
    ibd: $ibd,
    chain: $chain,
    pruned: $pruned,
    size_on_disk: $size_on_disk,
    percent: $percent
  }'
