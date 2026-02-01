# Bitcoin Power Law — Research Notes

## Origins
- **HC Burger (2019):** First formalized the power law corridor model
  - Blog: https://hcburger.com/blog/powerlaw/
  - Formula: `log10(price) = a + b * log10(days_since_genesis)`
  - Coefficients (2019): a = -17.016, b = 5.845
  - R² = 0.931 (improves over time!)
  
- **Giovanni Santostasi (2015/2024):** Expanded into full Power Law Theory (PLT)
  - Article: https://giovannisantostasi.medium.com/the-bitcoin-power-law-theory-962dfaf99ee9
  - Bitcoin behaves like a physical system, not a financial asset
  - Three interrelated power laws: Price ~ t⁶, Addresses ~ t³, Hash-rate ~ t¹²
  - Feedback loop: users → price (Metcalfe) → mining → security → more users
  - **Scale invariance**: system will continue scaling up predictably
  - Scarcity plays NO role (contradicts Stock-to-Flow model)

## The Model

### Two Bands
1. **Normal mode (lower band):** Price tracks power law closely. Good accumulation zone.
2. **Bull mode (upper band):** Price overshoots. Bubbles form and pop.
- Price spends ~50% time in each band.

### Power Oscillator
- Measures deviation from power law center
- Bubbles pop at oscillator 0.8-0.9 (price 6.3-8x above fit)
- Below median = good buy zone

### Key Properties
- **Diminishing returns:** Each cycle's gains are smaller in percentage terms
- **Longer recovery times:** 2011 peak→2 years, 2013→4 years, 2017→6 years
- **R² improves with time:** Model gets MORE accurate, not less

## Current Position (Feb 2026)

| Metric | Value |
|--------|-------|
| Days since genesis | 6,238 |
| BTC price | ~$77,650 |
| Power law center | ~$146,711 |
| Support line | ~$46,394 |
| Price/center ratio | 0.53 (below center) |
| Band position | Lower normal — accumulation zone |

## Predictions (HCBurger 2019 coefficients)

| Date | Support | Center | Bull Top |
|------|---------|--------|----------|
| Feb 2026 | $46k | $147k | $369k |
| Jan 2027 | $63k | $199k | $500k |
| Jan 2028 | $86k | $273k | $686k |
| Jan 2029 | $117k | $369k | $926k |
| Jan 2030 | $155k | $490k | $1.23M |

## Validation
- BTC hit $100k+ in late 2024 — model center predicted ~$100k for Jan 2025 ✅
- Current $77k pullback = normal mode band entry (exactly what model describes) ✅
- Bubble tops in 2011, 2013, 2017, 2021 all caught by power oscillator ✅

## Why Power Law > Stock-to-Flow
- S2F predicts non-diminishing returns (10x per halving forever) — empirically wrong
- S2F would predict ~$1M by 2025 — didn't happen
- Power law predicts diminishing returns — empirically correct
- Power law has fewer parameters, less overfitting risk
- Power law R² improves; S2F R² degrades

## Investment Implications
- **DCA > timing:** Power law says price always rises long-term. Timing is irrelevant at scale of years.
- **Current zone:** Below center = historically good accumulation area
- **Leveraged trading is unnecessary risk** — the power law gives ~10x per decade without leverage
- **Patience required:** Recovery from peaks takes longer each cycle

## Santostasi's Key Insight
Bitcoin is more like a **city growing** than a stock being traded:
- Cities follow power laws (Zipf's law, scaling laws)
- Growth comes from feedback loops, not speculation
- Bubbles are "punctuated equilibrium" — necessary growth spurts
- The Difficulty Adjustment acts as a thermostat keeping the system in power law regime

## Connection to Megapolitical Framework
- Davidson (Sovereign Individual) predicted "cybermoney" would grow as information tech grew
- The power law IS the mathematical expression of that growth
- Scale invariance means Bitcoin's trajectory is already established
- External events (ETFs, regulation, etc.) are *part of* the power law growth, not disruptions to it

---
*Created: 2026-02-01*
*Source: Daniel shared HC Burger link + own research*
