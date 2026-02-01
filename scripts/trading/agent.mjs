// Trading Agent — the brain that makes decisions
// This is NOT an algorithm. This is infrastructure for ME to think through trades.
import { createMarketClient, snapshot } from './market.mjs'

// My decision framework — not fixed rules, but a structured way to think
const FRAMEWORK = {
  // Position sizing: never risk more than this % of balance per trade
  maxRiskPerTrade: 0.02,     // 2% max risk per trade
  maxPositions: 3,            // max concurrent positions
  maxLeverage: 10,            // hard cap — no exceptions
  
  // Market regimes
  regimes: {
    trending: { minRsi: 30, maxRsi: 70, leverageRange: [2, 5] },
    ranging: { minRsi: 40, maxRsi: 60, leverageRange: [1, 3] },
    volatile: { leverageRange: [1, 2] }  // careful in volatile markets
  }
}

// Analyze market conditions and generate a structured assessment
export async function assess(network = 'mainnet') {
  const client = createMarketClient(network)
  const snap = await snapshot(client)
  
  const assessment = {
    timestamp: new Date().toISOString(),
    price: snap.ticker.index,
    spread: snap.ticker.spread,
    funding: snap.ticker.fundingRate,
    
    // Funding rate signal
    fundingSignal: interpretFunding(snap.ticker.fundingRate),
    
    // Technical picture
    technical: snap.analysis ? {
      rsi: snap.analysis.rsi14,
      rsiSignal: interpretRSI(snap.analysis.rsi14),
      trend: snap.analysis.sma7 && snap.analysis.sma25 
        ? (snap.analysis.sma7 > snap.analysis.sma25 ? 'bullish' : 'bearish')
        : 'unknown',
      momentum: snap.analysis.changePct,
      volatility: snap.analysis.volatility24h
    } : null,
    
    // What I'd consider doing (not automatic — I review this)
    considerations: []
  }
  
  // Build considerations based on what I see
  if (assessment.technical) {
    const { rsi, trend, momentum } = assessment.technical
    
    if (rsi !== null && rsi < 30) {
      assessment.considerations.push({
        type: 'opportunity',
        signal: 'oversold',
        direction: 'long',
        confidence: 'medium',
        note: `RSI at ${rsi.toFixed(1)} — oversold territory. Potential bounce.`
      })
    }
    
    if (rsi !== null && rsi > 70) {
      assessment.considerations.push({
        type: 'opportunity', 
        signal: 'overbought',
        direction: 'short',
        confidence: 'medium',
        note: `RSI at ${rsi.toFixed(1)} — overbought territory. Potential pullback.`
      })
    }
    
    if (trend === 'bullish' && momentum > 0) {
      assessment.considerations.push({
        type: 'confirmation',
        signal: 'trend_alignment',
        direction: 'long',
        note: 'SMA7 > SMA25 with positive momentum — trend intact'
      })
    }
    
    if (trend === 'bearish' && momentum < 0) {
      assessment.considerations.push({
        type: 'confirmation',
        signal: 'trend_alignment', 
        direction: 'short',
        note: 'SMA7 < SMA25 with negative momentum — downtrend intact'
      })
    }
  }
  
  // Funding rate considerations
  if (assessment.fundingSignal.bias) {
    assessment.considerations.push({
      type: 'funding',
      signal: 'funding_rate',
      direction: assessment.fundingSignal.bias,
      note: assessment.fundingSignal.note
    })
  }
  
  // Summary for my own consumption
  assessment.summary = formatAssessment(assessment)
  
  return assessment
}

function interpretFunding(rate) {
  if (rate > 0.0005) return { bias: 'short', note: `High funding ${(rate*100).toFixed(4)}% — longs paying shorts. Market overleveraged long.` }
  if (rate < -0.0003) return { bias: 'long', note: `Negative funding ${(rate*100).toFixed(4)}% — shorts paying longs. Unusual.` }
  return { bias: null, note: `Neutral funding ${(rate*100).toFixed(4)}%` }
}

function interpretRSI(rsi) {
  if (rsi === null) return 'unknown'
  if (rsi < 20) return 'extremely_oversold'
  if (rsi < 30) return 'oversold'
  if (rsi < 45) return 'bearish'
  if (rsi < 55) return 'neutral'
  if (rsi < 70) return 'bullish'
  if (rsi < 80) return 'overbought'
  return 'extremely_overbought'
}

function formatAssessment(a) {
  let lines = []
  lines.push(`📊 BTC $${a.price.toLocaleString()} | ${new Date(a.timestamp).toUTCString()}`)
  
  if (a.technical) {
    lines.push(`📈 Trend: ${a.technical.trend} | RSI: ${a.technical.rsi?.toFixed(1) || 'N/A'} (${a.technical.rsiSignal}) | 1h: ${a.technical.momentum > 0 ? '+' : ''}${a.technical.momentum}%`)
  }
  
  lines.push(`💰 Funding: ${a.fundingSignal.note}`)
  
  if (a.considerations.length > 0) {
    lines.push(`\n🧠 Considerations:`)
    for (const c of a.considerations) {
      lines.push(`  ${c.type === 'opportunity' ? '⚡' : '✅'} [${c.direction.toUpperCase()}] ${c.note}`)
    }
  } else {
    lines.push(`\n😐 No strong signals. Wait.`)
  }
  
  return lines.join('\n')
}

// Calculate position size based on risk management
export function calculatePosition({ balance, riskPct = FRAMEWORK.maxRiskPerTrade, stoplossDistance, leverage = 1 }) {
  // Risk amount in sats
  const riskAmount = Math.floor(balance * riskPct)
  
  // Margin needed = riskAmount (since stoploss limits our loss to this)
  // Quantity in USD = margin * leverage * price_per_sat
  // Simplified: margin = riskAmount, leverage determines exposure
  
  return {
    margin: riskAmount,
    leverage: Math.min(leverage, FRAMEWORK.maxLeverage),
    riskAmount,
    riskPct: riskPct * 100,
    note: `Risking ${riskAmount} sats (${(riskPct*100).toFixed(1)}% of ${balance})`
  }
}

// If run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const network = process.argv[2] || 'mainnet'
  console.log(`Assessing market (${network})...\n`)
  const a = await assess(network)
  console.log(a.summary)
}
