#!/bin/bash
# Lightning Node Data Exporter
# Exports LND data to JSON for analysis/backup
# Usage: ./export-node-data.sh [output_dir]

set -e

LNCLI="/home/neo/lnd-linux-amd64-v0.20.0-beta/lncli"
OUTPUT_DIR="${1:-/home/neo/.openclaw/workspace/data/lightning-exports}"
TIMESTAMP=$(date +%Y%m%d-%H%M%S)
EXPORT_DIR="$OUTPUT_DIR/$TIMESTAMP"

echo "🔍 Lightning Node Data Export"
echo "Output: $EXPORT_DIR"
mkdir -p "$EXPORT_DIR"

# Node info
echo "📊 Exporting node info..."
$LNCLI getinfo > "$EXPORT_DIR/node-info.json"

# Channels
echo "📡 Exporting channels..."
$LNCLI listchannels > "$EXPORT_DIR/channels.json"

# Peers
echo "🤝 Exporting peers..."
$LNCLI listpeers > "$EXPORT_DIR/peers.json"

# Invoices (last 100)
echo "🧾 Exporting invoices..."
$LNCLI listinvoices --max_invoices=100 > "$EXPORT_DIR/invoices.json"

# Payments (last 100)
echo "💸 Exporting payments..."
$LNCLI listpayments --max_payments=100 > "$EXPORT_DIR/payments.json"

# Forwards (routing stats)
echo "↔️  Exporting forwards..."
$LNCLI fwdinghistory --max_events=100 > "$EXPORT_DIR/forwards.json"

# Wallet balance
echo "💰 Exporting wallet..."
$LNCLI walletbalance > "$EXPORT_DIR/wallet-balance.json"
$LNCLI channelbalance > "$EXPORT_DIR/channel-balance.json"

# Fee report
echo "💵 Exporting fees..."
$LNCLI feereport > "$EXPORT_DIR/fee-report.json"

# Summary
cat > "$EXPORT_DIR/README.md" << EOF
# Lightning Node Export - $TIMESTAMP

Exported from ClaudioNode⚡

## Files:
- \`node-info.json\` - Node identity, version, sync status
- \`channels.json\` - All channels (active, inactive, pending)
- \`peers.json\` - Connected peers
- \`invoices.json\` - Last 100 invoices (received payments)
- \`payments.json\` - Last 100 payments (sent)
- \`forwards.json\` - Last 100 routing events
- \`wallet-balance.json\` - On-chain balance
- \`channel-balance.json\` - Lightning balance
- \`fee-report.json\` - Fee statistics

## Usage:
\`\`\`bash
# View node info
jq '.' node-info.json

# List channels
jq '.channels[] | {chan_id, capacity, local_balance, remote_balance}' channels.json

# Total routing fees earned
jq '[.forwarding_events[] | .fee_msat | tonumber] | add / 1000' forwards.json

# Payment success rate
jq '[.payments[] | .status == "SUCCEEDED"] | map(select(.) | 1) | length' payments.json
\`\`\`

Generated: $(date)
EOF

echo "✅ Export complete: $EXPORT_DIR"
echo ""
echo "Quick stats:"
$LNCLI getinfo | jq '{
  alias: .alias,
  pubkey: .identity_pubkey[:20],
  version: .version,
  block_height: .block_height,
  synced: .synced_to_chain,
  num_active_channels: .num_active_channels,
  num_peers: .num_peers
}'
