#!/bin/bash
# Quick Lightning analytics

echo "📊 ClaudioNode⚡ Analytics"
echo "========================"
echo ""

echo "🏦 BALANCES:"
echo "On-chain:" $(jq -r '.confirmed_balance' wallet-balance.json) "sats"
echo "Lightning:" $(jq -r '.balance' channel-balance.json) "sats"
echo ""

echo "📡 CHANNELS:"
jq -r '.channels[] | "\(.active ? "✅" : "❌") \(.chan_id) | Cap: \(.capacity) | Local: \(.local_balance) | Remote: \(.remote_balance)"' channels.json
echo ""

echo "🧾 INVOICES (last 10):"
jq -r '.invoices[-10:] | .[] | "\(.settled ? "✅" : "⏳") \(.value) sats | \(.memo // "no memo")"' invoices.json 2>/dev/null || echo "No invoices yet"
echo ""

echo "💸 PAYMENTS (last 10):"
jq -r '.payments[-10:] | .[] | "\(.status == "SUCCEEDED" ? "✅" : "❌") \(.value_sat) sats"' payments.json 2>/dev/null || echo "No payments yet"
echo ""

echo "↔️  ROUTING:"
TOTAL_FORWARDS=$(jq '[.forwarding_events[]] | length' forwards.json)
TOTAL_FEES=$(jq '[.forwarding_events[] | .fee_msat | tonumber] | add / 1000 // 0' forwards.json)
echo "Forwards: $TOTAL_FORWARDS"
echo "Fees earned: $TOTAL_FEES sats"
