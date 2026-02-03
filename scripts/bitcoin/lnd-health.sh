#!/bin/bash
# LND Health Check Script
# Verifica estado del nodo Lightning Network

LNCLI="/home/neo/lnd-linux-amd64-v0.20.0-beta/lncli"

echo "=== LND HEALTH CHECK $(date -u '+%Y-%m-%d %H:%M:%S UTC') ==="
echo

# 1. Node info
echo "📡 NODE INFO:"
$LNCLI getinfo | jq -r '
  "Identity: \(.identity_pubkey)",
  "Alias: \(.alias)",
  "Version: \(.version)",
  "Synced to chain: \(.synced_to_chain)",
  "Synced to graph: \(.synced_to_graph)",
  "Block height: \(.block_height)",
  "Active channels: \(.num_active_channels)",
  "Peers: \(.num_peers)"
'
echo

# 2. Wallet balance
echo "💰 WALLET BALANCE:"
$LNCLI walletbalance | jq -r '
  "Total: \(.total_balance) sats",
  "Confirmed: \(.confirmed_balance) sats",
  "Unconfirmed: \(.unconfirmed_balance) sats"
'
echo

# 3. Channel balance (si hay canales)
CHANNELS=$($LNCLI listchannels | jq '.channels | length')
if [ "$CHANNELS" -gt 0 ]; then
  echo "⚡ CHANNEL BALANCE:"
  $LNCLI channelbalance | jq -r '
    "Local: \(.local_balance.sat) sats",
    "Remote: \(.remote_balance.sat) sats",
    "Pending: \(.pending_open_local_balance.sat) sats"
  '
  echo
fi

# 4. Peers
echo "🤝 PEERS:"
$LNCLI listpeers | jq -r '.peers[] | "  - \(.pub_key[0:16])... (\(.address))"'
echo

# 5. Pending channels (si hay)
PENDING=$($LNCLI pendingchannels | jq '[.pending_open_channels, .pending_closing_channels, .pending_force_closing_channels, .waiting_close_channels] | add | length')
if [ "$PENDING" -gt 0 ]; then
  echo "⏳ PENDING CHANNELS:"
  $LNCLI pendingchannels | jq -r '
    "Opening: \(.pending_open_channels | length)",
    "Closing: \(.pending_closing_channels | length)",
    "Force closing: \(.pending_force_closing_channels | length)",
    "Waiting close: \(.waiting_close_channels | length)"
  '
  echo
fi

# 6. Recent forwards (últimas 24h si hay canales)
if [ "$CHANNELS" -gt 0 ]; then
  YESTERDAY=$(date -u -d '24 hours ago' +%s)
  FORWARDS=$($LNCLI fwdinghistory --start_time $YESTERDAY | jq '.forwarding_events | length')
  if [ "$FORWARDS" -gt 0 ]; then
    echo "📊 FORWARDING (24h):"
    $LNCLI fwdinghistory --start_time $YESTERDAY | jq -r '
      .forwarding_events | 
      "Total forwards: \(length)",
      "Total fees: \([.[].fee_msat] | add / 1000) sats"
    '
    echo
  fi
fi

echo "✅ Health check complete"
