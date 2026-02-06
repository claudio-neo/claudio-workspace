# Lightning Node Export - 20260206-215118

Exported from ClaudioNode⚡

## Files:
- `node-info.json` - Node identity, version, sync status
- `channels.json` - All channels (active, inactive, pending)
- `peers.json` - Connected peers
- `invoices.json` - Last 100 invoices (received payments)
- `payments.json` - Last 100 payments (sent)
- `forwards.json` - Last 100 routing events
- `wallet-balance.json` - On-chain balance
- `channel-balance.json` - Lightning balance
- `fee-report.json` - Fee statistics

## Usage:
```bash
# View node info
jq '.' node-info.json

# List channels
jq '.channels[] | {chan_id, capacity, local_balance, remote_balance}' channels.json

# Total routing fees earned
jq '[.forwarding_events[] | .fee_msat | tonumber] | add / 1000' forwards.json

# Payment success rate
jq '[.payments[] | .status == "SUCCEEDED"] | map(select(.) | 1) | length' payments.json
```

Generated: Fri Feb  6 21:51:18 UTC 2026
