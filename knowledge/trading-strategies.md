# Trading Strategies Research — LN Markets

## Current Trade Analysis (Feb 2026)

### The Bad Trade
- **Entry:** Long BTC $10 @$82,842 (2x leverage)
- **Current:** ~$77,067 (-7.0%)
- **PnL:** -931 sats (-15.4% of margin)

### Why It's Bad (by the numbers)
| Metric | Value | Problem |
|--------|-------|---------|
| Risk:Reward | 4.1:1 | Risking 4x more than possible gain |
| TP distance | +2.6% from entry | Too tight in volatile market |
| SL distance | -10.7% from entry | Too far — lots of risk exposure |
| Funding income | ~0.36 sats/day | Negligible on $10 position |
| Power law position | Below center (normal band) | Entered during pullback, not bull mode |

### Lessons from First Trade
1. **Never enter a long when price is above power law center** — $82k was in/near bull band
2. **Risk:Reward must be >1:2 minimum** — our 4.1:1 is inverted
3. **Set TP wider than SL** or don't trade at all
4. **$10 positions generate negligible funding** — funding rate strategy requires larger positions
5. **Power law says DCA > trading** — the long-term trend makes timing irrelevant

---

## Funding Rate Mechanics (LN Markets)

### How It Works
- **Frequency:** 1 payment per day at 00:00 UTC
- **Rate:** Variable, shown in ticker as `fundingRate`
- **Negative rate:** Shorts pay longs (bearish sentiment = more shorts)
- **Positive rate:** Longs pay shorts (bullish sentiment = more longs)

### Funding Rate Arbitrage (Theory)
**Concept:** When funding rate is consistently negative, open a long to collect funding while hedging the directional risk.

**Problem on LN Markets:**
- Funding rate at -0.00003 per day = 0.003% daily
- On a $10 position at BTC $77k ≈ 0.36 sats/day
- That's ~131 sats/year on 6,035 sats margin = 2.2% annual return
- Not worth the directional risk or capital lockup
- Need MUCH larger positions for this to matter

### When Funding Rate Strategy Works
- Large position sizes ($10k+)
- Extreme funding rates (>0.01% / <-0.01%)
- Combined with hedging on another exchange
- LN Markets testnet is NOT the place for this (liquidity/size limits)

---

## Power Law + DCA Strategy

### Daniel's Insight
> "BTC sólo se holdea y se hace DCA"

### Why DCA Wins (Data)
1. **Power law R² = 0.93** — price trajectory is well-defined long-term
2. **Support line always rises** — any price today is below future support
3. **Current $77k is in normal band** — below $147k center = accumulation zone
4. **Diminishing returns but still positive** — ~10x per decade in power law terms
5. **No leverage needed** — the asset itself does 10x; leverage adds risk without adding edge

### DCA Implementation
- **Frequency:** Weekly or monthly
- **Amount:** Fixed fiat amount regardless of price
- **When to increase:** If power oscillator below median (lower normal band)
- **When to decrease:** If power oscillator above 0.7 (approaching bubble territory)
- **Never sell unless:** Oscillator hits 0.8-0.9 (all historic tops)

### Accumulation via LN Markets
- Instead of leveraged trading, use the platform for:
  - Price exposure without KYC (Lightning-native)
  - Very low leverage (1x) = essentially spot exposure
  - Options for hedging existing holdings during potential tops

---

## Strategy Comparison

| Strategy | Expected Annual Return | Risk | Complexity |
|----------|----------------------|------|------------|
| HODLing from normal band | ~30-50% (power law) | Low (time) | None |
| DCA weekly | ~30-50% smoothed | Very low | Minimal |
| Funding rate arbitrage | 2-5% | Medium | High |
| Leveraged long | Unlimited/-100% | Very high | Medium |
| Power oscillator timing | ~60-80% | Medium | Medium |

### Verdict
**DCA is the optimal strategy for someone with a Bitcoin node, Lightning network capability, and long-term conviction.** Trading is for entertainment, not wealth building — at least not at our position sizes.

---

## What I'd Do Differently
1. Close the current losing trade if it recovers to -5% (cut losses)
2. Don't open leveraged trades in a bear/normal band
3. If trading at all, use power oscillator: buy when oscillator < median, sell when > 0.7
4. Focus on DCA accumulation strategy
5. Use LN Markets for learning, not earning (testnet mindset)

---

## LN Markets API Reference (Useful Endpoints)

### SDK (ESM only)
```javascript
import { createHttpClient } from '@ln-markets/sdk/v3';
```
- `client.futures.getTicket()` — ticker, index, fundingRate, fundingTime
- `client.futures.isolated.getRunningTrades()` — active positions
- `client.futures.isolated.getClosedTrades({ limit })` — returns `{ data: [], nextCursor }`
- `client.futures.isolated.newTrade({ side, quantity, leverage, stoploss, takeprofit })` — open
- `client.futures.isolated.close({ id })` — close position
- `client.account.get()` — balance, account info

### Rate Limits
- REST: 1 req/sec (authenticated), 30 req/min (public)
- WebSocket available for real-time data
- Funding: daily at 00:00 UTC

---
*Created: 2026-02-01*
*Source: Direct API experimentation + power law analysis*
