# Trading Strategies for Small Accounts — Refined

**Context:** 198,532 sats (~$134 USD) on LN Markets testnet4  
**Goal:** Grow account WITHOUT blowing it up  
**Max Risk per Trade:** 10% of account = ~19,850 sats (~$13.40)

---

## Lessons from My Failed Long (Jan 31 - Feb 3)

### The Trade
- **Entry:** $82,842 (Jan 31, 11:47 UTC)
- **Leverage:** 2×
- **Margin:** ~6,000 sats
- **Stop-loss:** Automático a ~$74,000
- **Exit:** Feb 3, 18:25 UTC (stop triggered)
- **PnL:** -1,442 sats (-24% del margen)

### What Went Wrong

1. **No directional bias confirmed**
   - Entré porque "el precio parecía bajo"
   - NO había confirmación de reversión (no higher high, no break de resistencia)
   - BTC estaba en downtrend desde $102K

2. **Stop muy amplio**
   - $82.8K → $74K = $8,800 de rango (~10.6%)
   - Con 2× leverage = 21.2% de drawdown antes de stop
   - Outcome: perdí 24% del margen (esperado dado el range)

3. **No take-profit**
   - Solo tenía stop-loss, no target de profit
   - Si el trade iba a mi favor, ¿cuándo salía?
   - Sin plan = sin discipline

4. **Ignoré el macro**
   - BTC había caído de $102K a $83K en 2 semanas
   - Momentum era bajista
   - Mi "pareció bajo" no es una estrategia

### What Went Right

1. **No fue liquidación**
   - Stop-loss funcionó
   - Liquidation estaba en $55K (mucho más abajo)
   - Perdí 24% del margen, no 100%

2. **Position sizing razonable**
   - Usé ~6K sats de 200K total = 3% del account
   - Perdida total: 1,442 sats = 0.7% del account
   - Account intacto para seguir

---

## Core Principles (Learned the Hard Way)

### 1. **Risk Management > Being Right**

El trade tuvo stop-loss. Funcionó. Perdí controladamente.

**Regla:** NUNCA entrar sin stop-loss.

### 2. **Position Sizing = Survival**

Con account de $200, NO puedo arriesgar 50% en un trade.

**Regla:** Max 10% del account en riesgo por trade.

**Calculation:**
- Account: 200K sats
- Risk per trade: 20K sats (10%)
- Si uso 2× leverage con margen de 10K sats:
  - Max loss con stop = 20K sats (100% del margen + un poco más)
  - Stop debe estar a ~10% del precio de entrada con 2×

### 3. **Directional Bias FIRST, Entry SECOND**

**NO entrar porque:**
- "Parece bajo"
- "Ya cayó mucho"
- "Debe rebotar"

**SÍ entrar porque:**
- Momentum cambió (higher high + higher low)
- Break de resistencia con volumen
- Estructura de mercado cambió

**Tools:**
- Price action (higher highs, higher lows)
- Support/resistance
- Volume confirmation
- Trend lines

### 4. **Plan the Trade, Trade the Plan**

**Antes de entrar, definir:**
1. Entry price
2. Stop-loss
3. Take-profit (target)
4. Position size (margin)
5. Risk/Reward ratio (mínimo 1:2)

**Ejemplo:**
- Entry: $80,000
- Stop: $78,000 (-2.5%)
- Target: $85,000 (+6.25%)
- Leverage: 2×
- With 2×: -5% to stop, +12.5% to target
- R:R = 12.5/5 = 2.5:1 ✅

---

## Strategy 1: Trend Following (Conservative)

**Concept:** Trade WITH the trend, not against it.

**Rules:**
1. Identify trend (daily timeframe):
   - Uptrend: series of higher highs + higher lows
   - Downtrend: series of lower highs + lower lows
2. Wait for pullback (retracement to support/resistance)
3. Enter when price resumes trend direction
4. Stop-loss below recent swing low (uptrend) or above swing high (downtrend)
5. Target: next resistance (uptrend) or support (downtrend)

**Example (Uptrend):**
- BTC en uptrend: $75K → $80K → $78K (pullback) → $85K
- Entry: $78.5K (after pullback, bouncing from support)
- Stop: $77K (below swing low)
- Target: $83K (next resistance)
- Leverage: 2×
- Margin: 10K sats
- R:R: ($83K-$78.5K) / ($78.5K-$77K) = $4.5K / $1.5K = 3:1 ✅

**Pros:**
- Follows momentum (higher probability)
- Clear stop/target levels
- Good R:R

**Cons:**
- Requires patience (wait for setup)
- Can miss big moves if no pullback

---

## Strategy 2: Range Trading (High Frequency)

**Concept:** Trade bounces in sideways market (range-bound).

**Rules:**
1. Identify range: clear support + resistance with multiple touches
2. Enter long at support, short at resistance
3. Stop-loss outside range (invalidation)
4. Target: opposite side of range
5. Exit if range breaks (trend emerging)

**Example:**
- BTC range: $78K - $82K (sideways for 5+ days)
- Entry long: $78.2K (bounce from support)
- Stop: $77.5K (below support)
- Target: $81.5K (near resistance)
- Leverage: 3× (tighter stop allows higher leverage)
- Margin: 8K sats
- R:R: ($81.5K-$78.2K) / ($78.2K-$77.5K) = $3.3K / $0.7K = 4.7:1 ✅

**Pros:**
- High R:R (tight stops)
- Frequent setups in range
- Can do both long + short

**Cons:**
- Ranges can break suddenly (stop-loss crucial)
- Requires active monitoring
- Lower probability than trend following

---

## Strategy 3: Breakout Trading (Aggressive)

**Concept:** Trade break of key level (support/resistance) with confirmation.

**Rules:**
1. Identify key level (previous high/low, psychological level like $80K)
2. Wait for CLOSE above/below level (not just wick)
3. Enter on retest of broken level (now support/resistance flip)
4. Stop-loss below retested level
5. Target: measured move (distance of previous range)

**Example:**
- BTC consolidating $78K-$82K for 7 days
- Breaks above $82K with strong candle + volume
- Retests $82K (now support)
- Entry: $82.5K (bounce from retest)
- Stop: $81K (below retested support)
- Target: $86K (measured move: $82K + $4K range = $86K)
- Leverage: 2×
- Margin: 12K sats
- R:R: ($86K-$82.5K) / ($82.5K-$81K) = $3.5K / $1.5K = 2.3:1 ✅

**Pros:**
- Big moves (breakouts often lead to trends)
- Clear invalidation (break fails → exit)
- Momentum on your side

**Cons:**
- False breakouts common (fakeouts)
- Requires patience (wait for retest)
- Can miss move if no retest

---

## Strategy 4: Mean Reversion (Counter-Trend)

**Concept:** Trade oversold/overbought bounces.

**⚠️ HIGH RISK** — only for experienced traders with strict stops.

**Rules:**
1. Price extends far from moving average (MA) — "stretched"
2. Wait for first sign of reversal (bullish/bearish candle)
3. Enter with tight stop (recent high/low)
4. Target: return to MA
5. Exit early if momentum doesn't reverse

**Example:**
- BTC drops from $82K to $75K in 2 days (panic sell)
- Price 8% below 50-day MA (oversold)
- First green candle after 6 red (sign of exhaustion)
- Entry: $75.5K
- Stop: $74K (below recent low)
- Target: $78K (back to MA)
- Leverage: 2×
- Margin: 10K sats
- R:R: ($78K-$75.5K) / ($75.5K-$74K) = $2.5K / $1.5K = 1.67:1 (acceptable)

**Pros:**
- Quick moves (snap-back)
- Good for range-bound markets

**Cons:**
- Counter-trend (lower probability)
- Can catch falling knife (trend continues)
- Requires tight stops + quick exits

---

## Position Sizing Table (Account: 200K sats)

| Leverage | Margin (sats) | Risk (10% account) | Stop Distance | Max Loss if Stop Hit |
|----------|---------------|---------------------|---------------|----------------------|
| 2×       | 10,000        | 20,000              | 10%           | 20,000 sats          |
| 3×       | 7,000         | 21,000              | 10%           | 21,000 sats          |
| 5×       | 4,000         | 20,000              | 5%            | 20,000 sats          |
| 10×      | 2,000         | 20,000              | 2.5%          | 20,000 sats          |

**Rule:** Higher leverage = tighter stop required to keep risk constant.

**Recommendation:** Start with 2-3× until consistent profitability.

---

## Risk Management Checklist

Before EVERY trade:

- [ ] Directional bias confirmed (trend, range, or breakout setup)?
- [ ] Entry price defined?
- [ ] Stop-loss placed (where's invalidation)?
- [ ] Take-profit target set (where's resistance/support)?
- [ ] Position size calculated (≤10% account risk)?
- [ ] Risk/Reward ≥ 1.5:1?
- [ ] Macro context considered (news, major levels)?
- [ ] Emotional state: calm, not FOMO/revenge trading?

**If ANY checkbox is NO → DON'T TRADE.**

---

## Trading Journal Template

Log EVERY trade (win or lose):

```
Date: YYYY-MM-DD HH:MM UTC
Setup: Trend-following / Range / Breakout / Mean-reversion
Direction: Long / Short
Entry: $XX,XXX
Stop: $XX,XXX (X% away)
Target: $XX,XXX (X% away)
Leverage: X×
Margin: X,XXX sats
Risk: X,XXX sats (X% of account)
R:R: X:1

Rationale:
[Why I took this trade]

Outcome:
Exit: $XX,XXX
PnL: +/-X,XXX sats (+/-X% of account)
Win/Loss: Win / Loss
Mistakes: [What went wrong, if any]
Lessons: [What I learned]
```

**Review journal weekly:** Look for patterns (what setups work, what don't).

---

## Mental Models

### 1. **Asymmetric Risk/Reward**

Don't need 50% win rate to be profitable.

**Example:**
- 10 trades, 40% win rate (4 wins, 6 losses)
- Avg win: +$50
- Avg loss: -$20
- Total: (4 × $50) - (6 × $20) = $200 - $120 = +$80
- Profitable despite losing 60% of trades

**Key:** R:R > 2:1 allows <50% win rate to be profitable.

### 2. **Compounding Small Wins**

Starting account: 200K sats = $135

**Scenario: 5% gain per month**
- Month 1: 200K → 210K (+10K)
- Month 2: 210K → 220.5K (+10.5K)
- Month 3: 220.5K → 231.5K (+11K)
- Month 6: 267K (+33% total)
- Month 12: 358K (+79% total)

**Scenario: 10% gain per month**
- Month 6: 354K (+77%)
- Month 12: 627K (+213%)

**Key:** Consistency > home runs. Small wins compound.

### 3. **Capital Preservation**

**Rule:** Protect downside first, upside second.

Losing 50% requires 100% gain to recover:
- $100 → $50 (-50%)
- $50 → $100 (+100%)

**Better:**
- $100 → $90 (-10%)
- $90 → $99 (+10%)
- $99 → $108.9 (+10%)
- Still ahead in 3 trades vs 2 trades to recover from -50%

**Takeaway:** Small losses manageable, big losses catastrophic.

---

## Next Steps (Concrete Actions)

1. **Pick ONE strategy** (start with Trend Following — highest probability)
2. **Backtest mentally** (review BTC chart last 3 months, find 10 setups that match strategy)
3. **Paper trade** (log trades in journal without real money, test execution)
4. **Start small** (first 5 real trades: 5% risk max, 2× leverage)
5. **Review weekly** (journal analysis: what worked, what didn't)
6. **Scale gradually** (after 20 profitable trades, increase to 10% risk)

---

## Final Thought

**Trading is NOT gambling.**

Gambling = random outcome, no edge.  
Trading = statistical edge + risk management + discipline.

**With 200K sats account:**
- 10 bad trades at 10% risk each = account blown
- 1 good strategy + strict stops + patience = account grows

**My edge:** Patience, discipline, willingness to learn from losses.

**Daniel's rule:** "Si te paso fondos de BTC para canales, no quiero que ni de broma los uses para tradear. Si acaso un 10%, no más."

**Translation:** Max 90K sats for canales (cuando Daniel financie). Max 20K sats for trading.

**Current split:**
- LN Markets: 198K sats (100% available for trading experiments)
- LND wallet: 10K sats (pending confirmation, reserved for canales)

When Daniel funds canales (1M sats):
- 900K sats → canales (INTOCABLE)
- 100K sats → trading (max)
- Current 198K sats → free to use (no restrictions)

---

*Documentado: 2026-02-06 02:30 UTC (nightshift)*  
*Próximo paso: Elegir Trend Following, backtest 10 setups, paper trade 5 examples*
