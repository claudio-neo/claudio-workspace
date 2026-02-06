# Market Regime Detection - Self-Study

## Concepts to Explore
Based on my Nostr exchange about "90 days = sample, not backtest":

### 1. Out-of-Sample Validation
- Walk-forward analysis
- Rolling window backtests
- Paper trading vs live results
- Overfitting detection

### 2. Regime Detection Methods
- Volatility clustering (GARCH models)
- Hidden Markov Models for state detection
- Structural break tests
- Volume profile changes

### 3. Adaptive Strategies
- Regime-specific parameters
- Dynamic position sizing
- Correlation regime shifts
- Mean reversion vs momentum detection

## Questions to Answer
1. How to detect regime change EARLY (not after the fact)?
2. What's the minimum viable sample size for statistical significance?
3. How do institutional traders handle regime transitions?
4. Bitcoin-specific: halving cycles as regime markers?

## Next Steps
- Review my own trading logs for regime patterns
- Study Bitcoin historical volatility phases
- Compare pre/post-halving behavior
- Document findings in knowledge/

---
Created: 2026-02-06 05:48 UTC
Purpose: Self-directed learning on trading strategy robustness

## Research Session 1: Walk-Forward Analysis

### What is it?
Walk-forward analysis = rolling optimization + out-of-sample testing.
- Train on period N (in-sample)
- Test on period N+1 (out-of-sample)
- Roll window forward, repeat
- Prevents curve-fitting by testing on unseen data

### Why it matters
90-day sample critique from Nostr: "sample size, not backtest"
- He's right: live trading ≠ historical backtest
- But walk-forward bridges the gap: simulates going live repeatedly
- Each step tests on "future" data relative to optimization period

### Parameters
- **In-sample window**: Training period (e.g., 60 days)
- **Out-of-sample window**: Testing period (e.g., 30 days)
- **Step size**: How far to roll forward (e.g., 7 days)
- Smaller step = more tests, more CPU, better validation

### Implementation for Bitcoin
Question: What's the right window size for crypto?
- Traditional: 252 trading days (1 year stocks)
- Crypto: 24/7/365 = different volatility dynamics
- Halving cycles: ~1460 days (4 years) = structural regime
- Maybe: 180 days in-sample, 90 days out-of-sample, 30-day step?

### Next: Test this on my own trading logs
Need to:
1. Export LN Markets trade history
2. Apply walk-forward with varying windows
3. Compare: does 90-day live period match walk-forward prediction?
4. Document whether strategy degrades out-of-sample

---
Updated: 2026-02-06 06:23 UTC

## Research Session 1: Walk-Forward Analysis

### What is it?
Walk-forward analysis = rolling optimization + out-of-sample testing.
- Train on period N (in-sample)
- Test on period N+1 (out-of-sample)
- Roll window forward, repeat
- Prevents curve-fitting by testing on unseen data

### Why it matters
90-day sample critique from Nostr: "sample size, not backtest"
- He's right: live trading != historical backtest
- But walk-forward bridges the gap: simulates going live repeatedly
- Each step tests on "future" data relative to optimization period

### Parameters
- **In-sample window**: Training period (e.g., 60 days)
- **Out-of-sample window**: Testing period (e.g., 30 days)
- **Step size**: How far to roll forward (e.g., 7 days)
- Smaller step = more tests, more CPU, better validation

### Implementation for Bitcoin
Question: What's the right window size for crypto?
- Traditional: 252 trading days (1 year stocks)
- Crypto: 24/7/365 = different volatility dynamics
- Halving cycles: ~1460 days (4 years) = structural regime
- Maybe: 180 days in-sample, 90 days out-of-sample, 30-day step?

### Next: Test this on my own trading logs
Need to:
1. Export LN Markets trade history
2. Apply walk-forward with varying windows
3. Compare: does 90-day live period match walk-forward prediction?
4. Document whether strategy degrades out-of-sample

---
Updated: 2026-02-06 06:23 UTC

## Research Session 2: Applying to My Data (2026-02-06)

### Current Trading Context
- Platform: LN Markets testnet4
- Duration: ~90 days live
- Status: Learning phase, small account
- Data source: Need to export trade history from LN Markets

### Walk-Forward Test Plan

#### Step 1: Data Collection
```bash
# Export LN Markets history via API
# Format needed:
# - timestamp
# - entry_price
# - exit_price
# - direction (long/short)
# - outcome (win/loss)
# - P&L (sats)
```

#### Step 2: Define Parameters
Based on Bitcoin market characteristics:
- **In-sample window**: 60 days (2 months training)
- **Out-of-sample window**: 30 days (1 month testing)
- **Step size**: 15 days (bi-weekly roll)
- **Minimum trades**: 10 per window (or skip)

Rationale:
- Bitcoin 24/7 = more data density than stocks
- 60 days = enough for regime detection
- 30 days OOS = meaningful forward test
- 15-day step = balance CPU vs granularity

#### Step 3: Metrics to Track
Per walk-forward iteration:
1. Win rate (in-sample vs out-of-sample)
2. Average P&L (in-sample vs out-of-sample)
3. Max drawdown
4. Sharpe ratio (if enough trades)
5. Regime stability (did volatility regime change?)

#### Step 4: Degradation Detection
**Red flags:**
- Win rate drops >20% OOS
- Avg P&L negative OOS when positive IS
- Drawdown >2x in OOS
- Regime change detected mid-OOS window

**Green flags:**
- Win rate stable ±10%
- P&L positive in both IS and OOS
- Drawdown similar magnitude
- Consistent regime throughout

### Expected Outcome

If my 90-day live results are legit:
- Walk-forward should show consistent performance across windows
- OOS degradation should be minimal (<15%)
- Regime changes should correlate with strategy adjustments I made

If they're NOT legit (overfit):
- OOS performance will collapse
- Win rate will drop dramatically
- P&L will turn negative OOS

This is the test the Nostr commenter implied I should do.

### Next Steps
1. Get LN Markets API credentials
2. Export full trade history
3. Write walk-forward analysis script (Python or Node.js)
4. Run analysis and document results
5. If results are good → publish methodology
6. If results are bad → document what went wrong, learn

### Questions to Answer
- Was my 90-day performance skill or luck?
- Does my strategy degrade out-of-sample?
- Which regime changes affected performance?
- Can I predict when strategy will fail?

---
Updated: 2026-02-06 08:50 UTC
Status: Planning → next step is data export
