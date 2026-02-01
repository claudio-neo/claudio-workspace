#!/usr/bin/env node
// Trading Analysis Tool — analyzes price action and suggests actions
// Usage: node scripts/trading/analyze.mjs [--hours 24] [--verbose]

import { createHttpClient } from '@ln-markets/sdk/v3'
import { readFileSync, writeFileSync, existsSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))
// Load .env from workspace root
const envPath = join(__dirname, '../../.env')
const envContent = readFileSync(envPath, 'utf8')
for (const line of envContent.split('\n')) {
  const match = line.match(/^([^#=]+)=(.*)$/)
  if (match) process.env[match[1].trim()] = match[2].trim()
}

const client = createHttpClient({
  network: 'testnet4',
  key: process.env.LNMARKETS_KEY,
  secret: process.env.LNMARKETS_SECRET,
  passphrase: process.env.LNMARKETS_PASSPHRASE
})

const hours = parseInt(process.argv.find(a => a.startsWith('--hours='))?.split('=')[1] || '24')
const verbose = process.argv.includes('--verbose')

async function analyze() {
  const [ticker, account, running] = await Promise.all([
    client.futures.getTicket(),
    client.account.get(),
    client.futures.isolated.getRunningTrades()
  ])

  const now = new Date()
  const candles = await client.futures.getCandles({
    from: new Date(now - hours * 60 * 60 * 1000).toISOString(),
    to: now.toISOString(),
    interval: hours <= 24 ? '1h' : '4h'
  })

  const data = candles.data || candles
  if (!Array.isArray(data) || data.length === 0) {
    console.log('No candle data available')
    return
  }

  // Price analysis
  const closes = data.map(c => c.close)
  const highs = data.map(c => c.high)
  const lows = data.map(c => c.low)

  const high = Math.max(...highs)
  const low = Math.min(...lows)
  const current = ticker.index
  const range = high - low
  const rangePos = range > 0 ? ((current - low) / range * 100).toFixed(1) : 50

  // Simple moving averages
  const sma = (arr, period) => {
    if (arr.length < period) return null
    const slice = arr.slice(-period)
    return slice.reduce((a, b) => a + b, 0) / period
  }

  const sma10 = sma(closes, 10)
  const sma20 = sma(closes, 20)

  // Volatility (simple: range as % of price)
  const volatility = (range / current * 100).toFixed(2)

  // Trend detection
  let trend = 'sideways'
  if (sma10 && sma20) {
    if (sma10 > sma20 && current > sma10) trend = 'bullish'
    else if (sma10 < sma20 && current < sma10) trend = 'bearish'
    else if (current > sma10) trend = 'recovering'
    else trend = 'weakening'
  }

  // Momentum (last 4 candles direction)
  const recentCloses = closes.slice(-4)
  const upCandles = recentCloses.filter((c, i) => i > 0 && c > recentCloses[i - 1]).length
  const momentum = upCandles >= 2 ? 'positive' : upCandles <= 0 ? 'negative' : 'neutral'

  console.log('=== Market Analysis ===')
  console.log(`Price: $${current.toLocaleString()} | Funding: ${ticker.fundingRate}`)
  console.log(`${hours}h Range: $${low.toLocaleString()} — $${high.toLocaleString()} (${volatility}% vol)`)
  console.log(`Position in range: ${rangePos}% (0=bottom, 100=top)`)
  console.log(`Trend: ${trend} | Momentum: ${momentum}`)
  if (sma10) console.log(`SMA10: $${sma10.toFixed(0)} | SMA20: ${sma20 ? '$' + sma20.toFixed(0) : 'n/a'}`)
  console.log(`Premium: ${((ticker.lastPrice - ticker.index) / ticker.index * 100).toFixed(4)}%`)

  // Account & positions
  console.log(`\n=== Account ===`)
  console.log(`Balance: ${account.balance.toLocaleString()} sats`)

  if (running.length > 0) {
    console.log(`\n=== Active Trades ===`)
    for (const t of running) {
      const pricePct = ((current - t.entryPrice) / t.entryPrice * 100).toFixed(2)
      const marginPct = (t.pl / t.entryMargin * 100).toFixed(1)
      console.log(`${t.side.toUpperCase()} $${t.quantity} @${t.entryPrice} → $${current} (${pricePct}%)`)
      console.log(`  PnL: ${t.pl} sats (${marginPct}%) | SL: ${t.stoploss || 'none'} | TP: ${t.takeprofit || 'none'}`)

      // Suggestions
      const suggestions = []
      if (!t.stoploss) suggestions.push('⚠️ Set a stop-loss!')
      if (!t.takeprofit) suggestions.push('💡 Consider setting take-profit')
      if (t.side === 'buy' && trend === 'bearish') suggestions.push('🔴 Long in bearish trend — consider closing')
      if (t.side === 'sell' && trend === 'bullish') suggestions.push('🔴 Short in bullish trend — consider closing')
      if (t.side === 'buy' && ticker.fundingRate < 0) suggestions.push('✅ Receiving funding (negative rate favors longs)')
      if (t.side === 'sell' && ticker.fundingRate > 0) suggestions.push('✅ Receiving funding (positive rate favors shorts)')
      if (parseFloat(marginPct) < -20) suggestions.push('🔴 Significant loss — review thesis')
      if (parseFloat(marginPct) > 20) suggestions.push('💰 Consider taking partial profit (cashIn)')

      if (suggestions.length > 0) {
        console.log('  Signals:')
        suggestions.forEach(s => console.log('    ' + s))
      }
    }
  } else {
    console.log('\nNo active trades.')

    // Entry suggestions when flat
    const suggestions = []
    if (parseFloat(rangePos) < 20 && trend !== 'bearish') suggestions.push('💡 Near range bottom — potential long entry')
    if (parseFloat(rangePos) > 80 && trend !== 'bullish') suggestions.push('💡 Near range top — potential short entry')
    if (ticker.fundingRate < -0.0005) suggestions.push('💡 Very negative funding — long would earn significant funding')
    if (ticker.fundingRate > 0.0005) suggestions.push('💡 Very positive funding — short would earn significant funding')
    if (suggestions.length > 0) {
      console.log('  Entry signals:')
      suggestions.forEach(s => console.log('    ' + s))
    }
  }

  // Output JSON for programmatic use
  if (verbose) {
    const analysis = {
      timestamp: now.toISOString(),
      price: current,
      funding: ticker.fundingRate,
      range: { high, low, position: parseFloat(rangePos) },
      trend, momentum, volatility: parseFloat(volatility),
      sma: { sma10, sma20 },
      balance: account.balance,
      trades: running.map(t => ({
        id: t.id, side: t.side, entry: t.entryPrice,
        pnl: t.pl, sl: t.stoploss, tp: t.takeprofit
      }))
    }
    console.log('\n--- JSON ---')
    console.log(JSON.stringify(analysis, null, 2))
  }
}

analyze().catch(e => console.error('Error:', e.message))
