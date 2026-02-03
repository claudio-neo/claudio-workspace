#!/usr/bin/env bash
# health-check.sh — All-in-one Bitcoin node health check

set -euo pipefail

BITCOIN_CLI="${BITCOIN_CLI:-bitcoin-cli}"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Initialize
status="healthy"
issues=()
checks='{}'

# Check 1: Node responsive
if ! timeout 5 $BITCOIN_CLI getblockchaininfo &>/dev/null; then
  status="critical"
  issues+=("Node not responsive (timeout)")
  checks=$(echo "$checks" | jq '. + {responsive: false}')
else
  checks=$(echo "$checks" | jq '. + {responsive: true}')
fi

# If node not responsive, bail early
if [ "$status" = "critical" ]; then
  jq -n \
    --arg status "$status" \
    --argjson issues "$(printf '%s\n' "${issues[@]}" | jq -R . | jq -s .)" \
    --argjson checks "$checks" \
    '{status: $status, issues: $issues, checks: $checks}'
  exit 0
fi

# Check 2: Sync status
sync_info=$("$SCRIPT_DIR/node-status.sh")
verification=$(echo "$sync_info" | jq -r '.verificationprogress')
synced=$(echo "$verification > 0.999" | bc -l)

if [ "$synced" -eq 1 ]; then
  checks=$(echo "$checks" | jq '. + {synced: true}')
else
  status="degraded"
  percent=$(echo "$sync_info" | jq -r '.percent')
  issues+=("Node not fully synced ($percent%)")
  checks=$(echo "$checks" | jq '. + {synced: false}')
fi

# Check 3: Peer connectivity
peer_info=$("$SCRIPT_DIR/peer-info.sh")
total_peers=$(echo "$peer_info" | jq -r '.total')

if [ "$total_peers" -ge 8 ]; then
  checks=$(echo "$checks" | jq '. + {peers: true}')
elif [ "$total_peers" -ge 4 ]; then
  status="degraded"
  issues+=("Low peer count ($total_peers, recommend ≥8)")
  checks=$(echo "$checks" | jq '. + {peers: "warning"}')
elif [ "$total_peers" -eq 0 ]; then
  status="critical"
  issues+=("No peers connected")
  checks=$(echo "$checks" | jq '. + {peers: false}')
else
  status="degraded"
  issues+=("Very low peer count ($total_peers)")
  checks=$(echo "$checks" | jq '. + {peers: "critical"}')
fi

# Check 4: Mempool size
mempool_info=$("$SCRIPT_DIR/mempool-stats.sh")
mempool_mb=$(echo "$mempool_info" | jq -r '.mb')
mempool_mb_int=$(printf "%.0f" "$mempool_mb")

if [ "$mempool_mb_int" -gt 50 ]; then
  if [ "$status" = "healthy" ]; then
    status="degraded"
  fi
  issues+=("Mempool very large (${mempool_mb} MB)")
  checks=$(echo "$checks" | jq '. + {mempool: "critical"}')
elif [ "$mempool_mb_int" -gt 30 ]; then
  if [ "$status" = "healthy" ]; then
    status="degraded"
  fi
  issues+=("Mempool elevated (${mempool_mb} MB)")
  checks=$(echo "$checks" | jq '. + {mempool: "warning"}')
else
  checks=$(echo "$checks" | jq '. + {mempool: true}')
fi

# Output final status
jq -n \
  --arg status "$status" \
  --argjson issues "$(printf '%s\n' "${issues[@]}" | jq -R . | jq -s .)" \
  --argjson checks "$checks" \
  '{status: $status, issues: $issues, checks: $checks}'
