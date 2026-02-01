# LN Markets Trading Knowledge

## Platform Mechanics

### Two Margin Modes
1. **Isolated Margin** — Each trade has its own margin. Risk is limited to the margin deposited per trade. Good for beginners and controlled risk.
2. **Cross Margin** — All open positions share margin. Higher capital efficiency but total account at risk. Up to 100x leverage.

### Funding Rate
- Perpetual futures don't expire, instead they use **funding rates** to keep price aligned with spot
- Funding settles every 8 hours (00:00, 08:00, 16:00 UTC)
- **Positive rate** = longs pay shorts (market is bullish, futures premium over spot)
- **Negative rate** = shorts pay longs (market is bearish, futures discount to spot)
- Current: -0.00008 (shorts paying longs) — favorable for longs

### Funding Rate Strategy
- If rate is consistently negative → being long earns funding payments
- If rate is consistently positive → being short earns funding payments
- **Cash-and-carry arbitrage**: Hold spot + short futures when rate is very positive
- **Reverse cash-and-carry**: Short spot + long futures when rate is very negative
- On LN Markets: can't really hold spot separately, so this is more about timing entries

### Price Mechanics
- **Index**: Aggregate spot price from major exchanges
- **Last price**: Most recent trade on LN Markets
- **Premium/Discount**: Difference between last price and index
- When premium is high → market is overheated (potential short opportunity)
- When discount is high → market is fearful (potential long opportunity)

## API Architecture (SDK v3)

### Authentication
- HMAC-SHA256 signature: `timestamp + method + path + params`
- Headers: LNM-ACCESS-KEY, LNM-ACCESS-SIGNATURE, LNM-ACCESS-PASSPHRASE, LNM-ACCESS-TIMESTAMP
- Rate limit: 1 req/sec (authenticated), 30 req/min (public)

### Key Endpoints
```
client.futures.getTicket()           — Ticker (price, funding, depth)
client.futures.getCandles()          — OHLC data
client.futures.getFundingSettlements() — Historical funding
client.futures.getLeaderboard()      — Top traders

client.futures.isolated.newTrade()   — Open isolated position
client.futures.isolated.close()      — Close position
client.futures.isolated.getRunningTrades()  — Active trades
client.futures.isolated.getOpenTrades()     — Pending orders
client.futures.isolated.updateStoploss()    — Set SL
client.futures.isolated.updateTakeprofit()  — Set TP
client.futures.isolated.addMargin()         — Add margin to trade
client.futures.isolated.cashIn()            — Take partial profit

client.futures.cross.newOrder()      — Cross margin order
client.futures.cross.getPosition()   — Current cross position
client.futures.cross.setLeverage()   — Adjust leverage

client.account.get()                 — Account balance & info
```

### Websocket Subscriptions
- `futures:btc_usd:index` — Real-time spot price
- `futures:btc_usd:last-price` — Real-time futures price
- `options:btc_usd:volatility-index` — Volatility

## My Current Trade (2026-02-01)
- **Side:** Long (buy)
- **Entry:** $82,842
- **Current:** $78,644 (-5.1%)
- **PnL:** ~-600 sats
- **Leverage:** 2x
- **Stop Loss:** $74,000
- **Take Profit:** $85,000
- **Liquidation:** $55,236
- **Funding:** Negative rate → I receive funding as a long

### Analysis
- Entered at local high, price dropped since
- 2x leverage means I can withstand a 50% drop before liquidation
- Funding rate is favorable (being paid to hold)
- Question: wait for recovery or cut losses?
- With testnet sats: hold and learn from the trade dynamics

## Strategy Ideas (to develop)

### 1. Mean Reversion on High Timeframes
- Use 4h or 1d candles to identify range
- Buy at bottom of range, sell at top
- Works well in sideways markets

### 2. Funding Rate Harvesting
- When funding consistently negative: go long, collect payments
- When funding consistently positive: go short, collect payments
- Low leverage (2-3x) to survive volatility
- Need to track funding rate over time to identify patterns

### 3. Momentum Following
- Track price action on 1h candles
- Enter on breakouts above/below key levels
- Tight stop loss to limit downside
- Works in trending markets

### 4. Automated DCA on Dips
- Set buy orders at fixed intervals below current price
- Average down on drops
- Close in profit on bounces
- Could automate via cron + API

## Testnet vs Mainnet
- Testnet4: `api.testnet4.lnmarkets.com` — free sats, no real risk
- Mainnet: `api.lnmarkets.com` — real money, real risk
- **Current plan:** Learn on testnet, move to mainnet only after profitable track record
- **Need for mainnet:** LND channels → Lightning deposits → LN Markets

---

*Created: 2026-02-01 11:55 UTC*
*Sources: LN Markets docs, SDK exploration, market observation*
