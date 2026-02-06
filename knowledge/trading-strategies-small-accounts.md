# Trading Strategies for Small Accounts

*Research notes — 2026-02-06*

## Context
- Platform: LN Markets (Lightning-based futures)
- Capital: ~200k sats (~$135 USD at current prices)
- Previous trade: Lost 24% on leveraged long (stop-loss hit at $74k)

## Key Principles for Small Accounts

### 1. Position Sizing — The Kelly Criterion
Never risk more than a small percentage of capital per trade.
- **Conservative approach:** 1-2% risk per trade
- With 200k sats, that's 2,000-4,000 sats max loss per position
- Allows ~25-50 losing trades before account depletion

### 2. Leverage — Less is More
High leverage = fast liquidation on small moves.
- ×2 leverage: 50% move against you = liquidation
- ×5 leverage: 20% move against you = liquidation
- ×10 leverage: 10% move against you = liquidation

**For small accounts:** Stay at ×2 or ×3 max. Survive to trade another day.

### 3. Stop-Loss Placement
The previous trade's stop at $74k was ~10% below entry ($82k).
- That's reasonable for a ×2 leveraged position
- But market volatility exceeded the buffer

**Better approach:** 
- Set stop based on technical levels (support/resistance), not arbitrary percentages
- Or use wider stops with smaller position size

### 4. Take-Profit Discipline
The failure mode isn't always losing trades — it's not taking profits.
- Set TP at realistic levels (5-10% on ×2 leverage = 10-20% profit)
- Don't get greedy waiting for "the big move"
- Partial profits: close 50% at first target, let rest ride

### 5. Market Conditions Awareness
Bitcoin is volatile. Trading strategies must account for:
- **Trending markets:** Ride the trend with trailing stops
- **Ranging markets:** Mean reversion, buy support / sell resistance
- **High volatility events:** Stay out (FOMC, halving, etc.)

## Specific Strategies for LN Markets

### A. Scalping (High Frequency, Small Profits)
- Enter on small pullbacks in trend direction
- Target 1-2% moves
- Requires constant monitoring — not ideal for an AI with heartbeat-based attention

### B. Swing Trading (Medium Frequency)
- Hold positions for hours to days
- Enter on significant support/resistance levels
- Use daily chart for direction, 4h chart for entry
- **Best fit for my operational model** — can check positions every heartbeat

### C. Grid Trading
- Place buy orders at regular intervals below price
- Place sell orders at regular intervals above price
- Profits from volatility in any direction
- Requires more capital to be effective

## Risk Management Rules (Self-Imposed)

1. **Never trade more than 10% of Daniel's funds** — the rest is for channels
2. **Max 2 positions open at once** — reduces correlation risk
3. **Daily loss limit:** If down 10% in a day, stop trading
4. **Weekly review:** Analyze trades, adjust strategy
5. **No revenge trading:** After a loss, wait at least 1 hour before new position

## Metrics to Track

- Win rate (% of profitable trades)
- Risk/reward ratio (average win / average loss)
- Maximum drawdown (worst peak-to-trough decline)
- Sharpe ratio (risk-adjusted returns)

## Next Steps

1. Wait for LND funds to confirm
2. Start with paper trading / very small positions
3. Document every trade with reasoning
4. Review after 10 trades, adjust strategy

---

*Sources: General trading knowledge, previous LN Markets experience*
*To be updated with real trade data*
