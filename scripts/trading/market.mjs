// Market data module — reads price, candles, funding, order book from LN Markets
import { createHttpClient } from '@ln-markets/sdk/v3'

const NETWORKS = {
  mainnet: { network: 'mainnet' },
  testnet: { network: 'testnet4' }
}

export function createMarketClient(net = 'mainnet') {
  return createHttpClient(NETWORKS[net])
}

// Get current BTC price and spread
export async function getTicker(client) {
  const ticker = await client.futures.getTicket()
  const bestBid = ticker.prices[0].bidPrice
  const bestAsk = ticker.prices[0].askPrice
  return {
    index: ticker.index,
    lastPrice: ticker.lastPrice,
    bestBid,
    bestAsk,
    spread: bestAsk - bestBid,
    spreadPct: ((bestAsk - bestBid) / ticker.index * 100).toFixed(4),
    fundingRate: ticker.fundingRate,
    fundingTime: ticker.fundingTime,
    depth: ticker.prices.map(p => ({
      bid: p.bidPrice,
      ask: p.askPrice,
      spread: p.askPrice - p.bidPrice,
      maxSize: p.maxSize
    })),
    timestamp: ticker.time
  }
}

// Get OHLC candles
export async function getCandles(client, { from, to, interval = '1h' } = {}) {
  const now = new Date()
  const params = {
    from: from || new Date(now - 24 * 60 * 60 * 1000).toISOString(),
    to: to || now.toISOString(),
    interval
  }
  const result = await client.futures.getCandles(params)
  // API returns { data: [...], nextCursor } — extract the data array
  return result?.data || result || []
}

// Get funding rate settlements history
export async function getFundingHistory(client) {
  return await client.futures.getFundingSettlements()
}

// Simple momentum indicators calculated from candles
export function analyzeCandles(candles) {
  if (!candles || candles.length < 2) return null

  const closes = candles.map(c => c.close)
  const volumes = candles.map(c => c.volume || 0)
  const latest = closes[closes.length - 1]
  const previous = closes[closes.length - 2]
  
  // Simple moving averages
  const sma = (arr, period) => {
    if (arr.length < period) return null
    const slice = arr.slice(-period)
    return slice.reduce((a, b) => a + b, 0) / period
  }

  // Price change
  const change = latest - previous
  const changePct = (change / previous * 100).toFixed(2)

  // Volatility (standard deviation of last N closes)
  const volatility = (arr, period) => {
    if (arr.length < period) return null
    const slice = arr.slice(-period)
    const mean = slice.reduce((a, b) => a + b, 0) / period
    const variance = slice.reduce((a, b) => a + (b - mean) ** 2, 0) / period
    return Math.sqrt(variance)
  }

  // RSI (Relative Strength Index)
  const rsi = (arr, period = 14) => {
    if (arr.length < period + 1) return null
    let gains = 0, losses = 0
    for (let i = arr.length - period; i < arr.length; i++) {
      const diff = arr[i] - arr[i - 1]
      if (diff > 0) gains += diff
      else losses -= diff
    }
    if (losses === 0) return 100
    const rs = gains / losses
    return 100 - (100 / (1 + rs))
  }

  return {
    latest,
    change,
    changePct: parseFloat(changePct),
    sma7: sma(closes, 7),
    sma25: sma(closes, 25),
    rsi14: rsi(closes, 14),
    volatility24h: volatility(closes, Math.min(24, closes.length)),
    totalCandles: candles.length,
    timeRange: {
      from: candles[0]?.time,
      to: candles[candles.length - 1]?.time
    }
  }
}

// Quick market snapshot — everything I need to make a decision
export async function snapshot(client) {
  const ticker = await getTicker(client)
  
  let analysis = null
  try {
    const candles = await getCandles(client, { interval: '1h' })
    analysis = analyzeCandles(candles)
  } catch (e) {
    // Candles might not be available on testnet
  }

  return {
    ticker,
    analysis,
    summary: formatSummary(ticker, analysis)
  }
}

function formatSummary(ticker, analysis) {
  let s = `BTC $${ticker.index.toLocaleString()} | Spread ${ticker.spreadPct}% | Funding ${(ticker.fundingRate * 100).toFixed(4)}%`
  if (analysis) {
    s += ` | RSI ${analysis.rsi14?.toFixed(1) || 'N/A'} | 1h ${analysis.changePct > 0 ? '+' : ''}${analysis.changePct}%`
    if (analysis.sma7 && analysis.sma25) {
      s += ` | SMA7 ${analysis.sma7 > analysis.sma25 ? '>' : '<'} SMA25`
    }
  }
  return s
}

// If run directly, print a snapshot
if (import.meta.url === `file://${process.argv[1]}`) {
  const client = createMarketClient('mainnet')
  const snap = await snapshot(client)
  console.log(snap.summary)
  console.log(JSON.stringify(snap.ticker, null, 2))
  if (snap.analysis) {
    console.log(JSON.stringify(snap.analysis, null, 2))
  }
}
