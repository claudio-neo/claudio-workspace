# Walk-Forward Analysis Tool

**Created:** 2026-02-06 09:50 UTC  
**Purpose:** Validate trading strategies using rolling window optimization + out-of-sample testing

## What is Walk-Forward Analysis?

A backtesting methodology that prevents overfitting by:
1. Training on historical period (in-sample)
2. Testing on subsequent period (out-of-sample)
3. Rolling the window forward repeatedly
4. Measuring performance degradation

**Why it matters:** Addresses the critique "90 days = sample, not backtest"

## Usage

```bash
# Basic usage
node walk-forward-analysis.js trades.json

# Save results to file
node walk-forward-analysis.js trades.json results.json
```

## Input Format

### JSON Format
```json
[
  {
    "timestamp": "2025-11-01T10:30:00Z",
    "entryPrice": 67500,
    "exitPrice": 68000,
    "direction": "long",
    "outcome": "win",
    "pnl": 150
  },
  ...
]
```

### CSV Format
```csv
timestamp,entryPrice,exitPrice,direction,outcome,pnl
2025-11-01T10:30:00Z,67500,68000,long,win,150
2025-11-01T14:20:00Z,68200,67800,short,loss,-80
...
```

## Configuration

Edit `CONFIG` object in script:
```javascript
const CONFIG = {
  inSampleDays: 60,      // Training period
  outSampleDays: 30,     // Testing period
  stepDays: 15,          // Roll forward interval
  minTradesPerWindow: 10 // Skip windows with insufficient data
};
```

## Output Metrics

### Per Window
- **Trade count:** Number of trades in period
- **Win rate:** Percentage of profitable trades
- **Avg P&L:** Average profit/loss per trade
- **Total P&L:** Cumulative profit/loss
- **Max drawdown:** Largest peak-to-trough decline
- **Sharpe ratio:** Risk-adjusted return (simplified)

### Degradation Analysis
- **Win rate delta:** Change from IS to OOS
- **Avg P&L delta:** Change from IS to OOS
- **Drawdown ratio:** OOS drawdown / IS drawdown

## Verdict System

### PASS (Green)
✅ Win rate stable ±10%  
✅ P&L positive in both IS and OOS  
✅ Drawdown similar magnitude  

### WARNING (Yellow)
⚠️ One red flag detected  
⚠️ Moderate degradation  

### FAIL (Red)
❌ Win rate dropped >20%  
❌ Avg P&L turned negative OOS  
❌ Drawdown >2x in OOS  

## Example Output

```
📊 Walk-Forward Analysis

Trade history: trades.json
Config: 60d IS, 30d OOS, 15d step

Loaded 150 trades

Created 4 walk-forward windows

=== Window 1: 2025-11-01 → 2026-01-15 ===

In-Sample (45 trades):
  Win Rate: 55.6%
  Avg P&L: 12.50 sats
  Total P&L: 562 sats
  Max DD: 120 sats
  Sharpe: 1.23

Out-of-Sample (22 trades):
  Win Rate: 50.0% (-5.6%)
  Avg P&L: 8.20 sats (-4.30)
  Total P&L: 180 sats
  Max DD: 95 sats (0.79x)
  Sharpe: 0.98

Verdict: PASS
✅ Green flags: Win rate stable ±10%, P&L positive in both IS and OOS, Drawdown similar magnitude

...

=== SUMMARY ===
Total windows: 4
PASS: 3 | WARNING: 1 | FAIL: 0
Success rate: 75.0%

💾 Results saved to results.json
```

## Interpreting Results

### Strategy is LEGIT if:
- Most windows show PASS verdict
- OOS performance degrades <15%
- Drawdowns remain controlled
- Sharpe ratio stays positive

### Strategy is OVERFIT if:
- Most windows show FAIL verdict
- OOS performance collapses
- Drawdowns explode OOS
- Sharpe ratio turns negative

### Strategy is REGIME-DEPENDENT if:
- Some windows PASS, others FAIL
- Correlates with known market events
- Requires adaptive parameters

## Next Steps After Analysis

1. **If PASS:** Forward-test live (paper trading)
2. **If WARNING:** Investigate degradation sources, adjust parameters
3. **If FAIL:** Strategy is overfit, redesign from scratch

## Integration with LN Markets

To export your LN Markets history:
```bash
# Use LN Markets API to export trade history
# Save as trades.json
# Run walk-forward analysis
node walk-forward-analysis.js trades.json ln-markets-wf-results.json
```

## References

- Original research motivation: Nostr reply "90 days = sample, not backtest"
- Methodology: knowledge/trading-regime-detection-study.md
- Related: knowledge/backtest-trend-following-btc-90d.md

---

**Status:** Tool complete, ready to use  
**Blocker:** Need LN Markets API credentials to export trade history  
**ETA:** Can run analysis as soon as data is available
