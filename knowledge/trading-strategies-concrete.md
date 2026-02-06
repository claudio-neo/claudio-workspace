# Trading Strategies - Concrete Implementation Plans

## Context
- Platform: LN Markets (testnet4 for learning, mainnet later)
- Asset: BTC/USD perpetual futures
- Leverage: 2-5x (conservative, allows -20% to -50% drawdown before liquidation)
- Capital: Testnet sats for now, mainnet when profitable track record proven

## Strategy 1: Funding Rate Harvesting (Low Risk)

### Concept
Perpetual futures use funding rates to keep price aligned with spot. When funding is consistently negative, longs get paid. When positive, shorts get paid.

### Entry Rules
```
IF funding_rate < -0.01% for 3+ consecutive periods (24h)
  AND volatility < 3% (24h ATR)
  THEN open_long(leverage=2x)
  
IF funding_rate > 0.01% for 3+ consecutive periods
  AND volatility < 3%
  THEN open_short(leverage=2x)
```

### Exit Rules
```
IF funding_rate flips sign (negative → positive or vice versa)
  OR price moved 5% against position
  OR held for 7 days
  THEN close_position()
```

### Expected Return
- Funding payments: ~0.01% × 3 periods/day × 7 days = ~0.21% per week
- On 2x leverage: ~0.42% per week = ~22% annual
- Risk: Price movement can wipe gains if market trends strongly

### Implementation
```javascript
// scripts/trading/funding-rate-strategy.js
// Fetch funding rate history via API
// Check if conditions met
// Execute trade via lnm.futuresNewTrade()
// Monitor position, close when exit conditions met
```

## Strategy 2: Mean Reversion on 4H Range (Medium Risk)

### Concept
In sideways markets, price oscillates within a range. Buy at support, sell at resistance.

### Setup Phase (Manual)
1. Identify current range on 4H chart (last 2 weeks)
2. Mark support (bottom 25% of range) and resistance (top 25%)
3. Confirm: price touched support/resistance 3+ times

### Entry Rules
```
IF price <= support + 1%
  AND RSI_4H < 40
  AND no breakout in last 48h
  THEN open_long(leverage=3x, stop_loss=support-3%, take_profit=resistance)

IF price >= resistance - 1%
  AND RSI_4H > 60
  AND no breakout in last 48h
  THEN open_short(leverage=3x, stop_loss=resistance+3%, take_profit=support)
```

### Exit Rules
```
IF price >= take_profit
  OR price <= stop_loss
  OR range breaks (volatility spike >5% in 1H)
  THEN close_position()
```

### Expected Return
- Win rate: ~60% (sideways markets favor mean reversion)
- R:R ratio: 2:1 (take profit at mid-range, stop at -3%)
- Frequency: 2-3 trades per week
- Expected: (0.6 × 2 - 0.4 × 1) × 3 trades × 3% × 3x = ~10.8% per week (when working)
- Risk: Fails brutally in trending markets

### Implementation
```javascript
// scripts/trading/mean-reversion-strategy.js
// Fetch 4H candles (last 2 weeks)
// Calculate support/resistance (quantile-based)
// Calculate RSI
// Check entry conditions
// Set SL/TP on order
```

## Strategy 3: Momentum Breakout (High Risk, High Reward)

### Concept
When price breaks above resistance or below support with volume, trend likely continues. Ride the momentum.

### Entry Rules
```
IF price > resistance + 2%
  AND volume_1H > avg_volume_24H * 1.5
  AND RSI_1H > 55 (not overbought yet)
  THEN open_long(leverage=5x, stop_loss=resistance-1%, take_profit=+8%)

IF price < support - 2%
  AND volume_1H > avg_volume_24H * 1.5
  AND RSI_1H < 45
  THEN open_short(leverage=5x, stop_loss=support+1%, take_profit=-8%)
```

### Exit Rules
```
IF price >= take_profit (+8%)
  OR price <= stop_loss (breakout failed)
  OR momentum fades (volume drops <50% of entry volume for 2H)
  THEN close_position()
```

### Expected Return
- Win rate: ~45% (many fake breakouts)
- R:R ratio: 4:1 (TP at 8%, SL at -2%)
- Frequency: 1-2 trades per week
- Expected: (0.45 × 4 - 0.55 × 1) × 1.5 trades × 2% × 5x = ~13.5% per week (when working)
- Risk: Whipsaws are brutal, liquidation risk high with 5x

### Implementation
```javascript
// scripts/trading/breakout-strategy.js
// Fetch 1H candles + volume
// Identify support/resistance
// Detect breakout + volume confirmation
// Enter with tight SL, trail if profitable
```

## Strategy 4: Automated DCA on Dips (Conservative)

### Concept
Stack sats on every -X% dip. Average down, sell when back in profit.

### Entry Rules
```
Starting from current_price:
Place limit buy orders at:
- current_price * 0.97 (3% dip)
- current_price * 0.94 (6% dip)
- current_price * 0.91 (9% dip)

Each order: equal size (e.g., 1000 sats per level)
Leverage: 2x (safe)
```

### Exit Rules
```
When ALL orders filled:
  average_entry = sum(fills) / count(fills)
  take_profit = average_entry * 1.03 (3% profit)
  
  Place limit sell at take_profit
  OR hold if funding negative (get paid to wait)
```

### Expected Return
- Depends on volatility
- In choppy markets: ~1 full cycle per week = 3% per cycle
- Capital efficiency: Low (requires waiting for dips)
- Risk: Very low (2x leverage, DCA smooths entry)

### Implementation
```javascript
// scripts/trading/dca-strategy.js
// Place 3 limit orders below current price
// Monitor fills
// Calculate average entry
// Place take-profit order
// Repeat when cycle completes
```

## Backtesting Requirements

Before running ANY strategy live (even testnet):

1. **Data Collection**
   - Fetch 90 days of 1H candles
   - Fetch funding rate history (same period)
   - Fetch volume data

2. **Walk-Forward Analysis**
   - Train on first 60 days
   - Test on next 30 days
   - Repeat with rolling window
   - Validate: does strategy edge persist?

3. **Metrics to Track**
   ```
   - Win rate
   - Average win vs average loss
   - Max drawdown
   - Sharpe ratio
   - Calmar ratio
   - Profit factor
   ```

4. **Red Flags**
   - Win rate < 40% (unless R:R compensates)
   - Max drawdown > 25%
   - Sharpe < 1.0
   - Strategy works ONLY in specific market regime

## Risk Management Rules (NON-NEGOTIABLE)

1. **Never risk more than 5% per trade**
   - With 2x leverage: stop loss at -2.5%
   - With 5x leverage: stop loss at -1%

2. **Max 3 open positions simultaneously**
   - Prevents overexposure
   - Forces selectivity

3. **Cut losers fast, let winners run**
   - If SL hit → close immediately, no "waiting for recovery"
   - If TP hit 50% → move SL to breakeven, let rest run

4. **Track every trade**
   - Log: entry, exit, reason, P&L, emotions
   - Review weekly: what worked, what didn't

5. **Kill strategy if 5 losses in a row**
   - Market regime changed
   - Strategy no longer has edge
   - Re-backtest, adjust, or abandon

## Implementation Roadmap

### Phase 1: Data & Backtest (Current)
- [ ] Export 90 days historical data from LN Markets API
- [ ] Build walk-forward backtesting framework
- [ ] Test Strategy 1 (funding rate harvesting)
- [ ] Document results, refine parameters

### Phase 2: Paper Trading (Testnet)
- [ ] Deploy Strategy 1 on testnet
- [ ] Run for 30 days
- [ ] Track results vs backtest
- [ ] If profitable → proceed to Phase 3
- [ ] If not → back to Phase 1

### Phase 3: Live (Mainnet, Small Size)
- [ ] Deploy with 10,000 sats max per trade
- [ ] Run for 60 days
- [ ] If profitable → scale up
- [ ] If not → reassess

---

**Current Status:** Phase 1 blocked (LN Markets API credentials expired)
**Next Step:** Request new API keys from Daniel or regenerate on platform

*Created: 2026-02-06 21:54 UTC*
*Author: Claudio*
