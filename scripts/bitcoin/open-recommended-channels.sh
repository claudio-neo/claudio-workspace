#!/bin/bash
# Open channels recommended by Amboss Channel Recommender
# Usage: ./open-recommended-channels.sh [capacity_per_channel_sats]
#
# Prerequisites:
# - LND running and unlocked
# - On-chain balance sufficient for channels + fees
# - Amboss API (free, no auth needed for altruistic mode)

LNCLI="/home/neo/lnd-linux-amd64-v0.20.0-beta/lncli"
LNDDIR="/home/neo/.lnd"
PUBKEY="02c8e87a7ab29092eba909533919c508839aea48d8e6a88c39c42a0f198a5f6401"
CAPACITY=${1:-500000}  # Default 500K sats per channel

echo "⚡ Amboss Channel Recommender"
echo "Node: $PUBKEY"
echo "Capacity per channel: $CAPACITY sats"
echo ""

# Check wallet balance first
BALANCE=$($LNCLI --lnddir=$LNDDIR --network=mainnet walletbalance 2>&1 | python3 -c "import sys,json; print(json.load(sys.stdin)['confirmed_balance'])")
echo "Wallet balance: $BALANCE sats"

if [ "$BALANCE" -lt "$CAPACITY" ]; then
    echo "❌ Insufficient balance. Need at least $CAPACITY sats."
    echo ""
    echo "Fund the wallet:"
    ADDR=$($LNCLI --lnddir=$LNDDIR --network=mainnet newaddress p2wkh 2>&1 | python3 -c "import sys,json; print(json.load(sys.stdin)['address'])")
    echo "  Address: $ADDR"
    exit 1
fi

# Get recommendations from Amboss
echo ""
echo "Fetching recommendations from Amboss..."
RECS=$(curl -s -X POST https://api.amboss.space/graphql \
    -H "Content-Type: application/json" \
    -d "{\"query\": \"query { getRecommendedChannels(input: { mode: ALTRUISTIC, capacity: \\\"${CAPACITY}\\\", pubkey: \\\"${PUBKEY}\\\" }) { list { pubkey capacity node { graph_info { node { alias } } } } } }\"}" 2>&1)

# Parse recommendations
echo "$RECS" | python3 -c "
import sys, json
try:
    data = json.load(sys.stdin)
    recs = data.get('data', {}).get('getRecommendedChannels', {}).get('list', [])
    if not recs:
        print('No recommendations available (node may need to be claimed on Amboss)')
        sys.exit(0)
    print(f'Got {len(recs)} recommendations:')
    for i, r in enumerate(recs):
        alias = r.get('node', {}).get('graph_info', {}).get('node', {}).get('alias', 'unknown')
        print(f'  {i+1}. {alias} ({r[\"pubkey\"][:16]}...) capacity={r[\"capacity\"]}')
except Exception as e:
    print(f'Error parsing: {e}')
    print(sys.stdin.read() if hasattr(sys.stdin, 'read') else '')
"

echo ""
echo "To open a channel manually:"
echo "  $LNCLI --lnddir=$LNDDIR --network=mainnet openchannel <pubkey> $CAPACITY"
echo ""
echo "To open all recommended channels, run with --execute flag"

if [ "$2" = "--execute" ]; then
    echo ""
    echo "Opening channels..."
    echo "$RECS" | python3 -c "
import sys, json, subprocess
data = json.load(sys.stdin)
recs = data.get('data', {}).get('getRecommendedChannels', {}).get('list', [])
for r in recs[:3]:  # Max 3 channels at once
    pubkey = r['pubkey']
    alias = r.get('node', {}).get('graph_info', {}).get('node', {}).get('alias', 'unknown')
    print(f'Connecting to {alias}...')
    # Would need address to connect — skipping connect step, openchannel handles it if already peered
    print(f'Opening channel to {pubkey[:16]}... ({int('$CAPACITY')} sats)')
    result = subprocess.run([
        '$LNCLI', '--lnddir=$LNDDIR', '--network=mainnet',
        'openchannel', pubkey, '$CAPACITY'
    ], capture_output=True, text=True)
    if result.returncode == 0:
        print(f'  ✅ Channel opening initiated')
    else:
        print(f'  ❌ Error: {result.stderr.strip()}')
"
fi
