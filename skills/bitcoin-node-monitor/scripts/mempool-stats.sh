#!/usr/bin/env bash
# mempool-stats.sh — Fetch Bitcoin Core mempool statistics

set -euo pipefail

BITCOIN_CLI="${BITCOIN_CLI:-bitcoin-cli}"

# Fetch mempool info
info=$($BITCOIN_CLI getmempoolinfo)

# Extract fields
size=$(echo "$info" | jq -r '.size')
bytes=$(echo "$info" | jq -r '.bytes')
usage=$(echo "$info" | jq -r '.usage')
max_mempool=$(echo "$info" | jq -r '.maxmempool')

# Calculate MB
mb=$(echo "scale=2; $bytes / 1024 / 1024" | bc)

# Fetch fee estimates (optional, may fail on regtest)
minfee=$(echo "$info" | jq -r '.minfee // 0')
medianfee=$($BITCOIN_CLI estimatesmartfee 6 2>/dev/null | jq -r '.feerate // 0' || echo "0")
maxfee=$($BITCOIN_CLI estimatesmartfee 1 2>/dev/null | jq -r '.feerate // 0' || echo "0")

# Output JSON
jq -n \
  --argjson size "$size" \
  --argjson bytes "$bytes" \
  --argjson usage "$usage" \
  --argjson max_mempool "$max_mempool" \
  --arg mb "$mb" \
  --argjson minfee "$minfee" \
  --argjson medianfee "$medianfee" \
  --argjson maxfee "$maxfee" \
  '{
    size: $size,
    bytes: $bytes,
    usage: $usage,
    max_mempool: $max_mempool,
    mb: $mb,
    minfee: $minfee,
    medianfee: $medianfee,
    maxfee: $maxfee
  }'
