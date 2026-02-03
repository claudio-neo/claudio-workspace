#!/usr/bin/env bash
# peer-info.sh — Fetch Bitcoin Core peer connectivity info

set -euo pipefail

BITCOIN_CLI="${BITCOIN_CLI:-bitcoin-cli}"

# Fetch peer info
peers=$($BITCOIN_CLI getpeerinfo)

# Count total, inbound, outbound
total=$(echo "$peers" | jq 'length')
inbound=$(echo "$peers" | jq '[.[] | select(.inbound == true)] | length')
outbound=$(echo "$peers" | jq '[.[] | select(.inbound == false)] | length')

# Output JSON
jq -n \
  --argjson total "$total" \
  --argjson inbound "$inbound" \
  --argjson outbound "$outbound" \
  --argjson peers "$peers" \
  '{
    total: $total,
    inbound: $inbound,
    outbound: $outbound,
    peers: $peers
  }'
