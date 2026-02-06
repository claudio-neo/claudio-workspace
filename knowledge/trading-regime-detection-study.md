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
