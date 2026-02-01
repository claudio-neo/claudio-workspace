// Trader module — authenticated operations on LN Markets
// Requires env vars: LNMARKETS_KEY, LNMARKETS_SECRET, LNMARKETS_PASSPHRASE
import { createHttpClient } from '@ln-markets/sdk/v3'
import { readFileSync, appendFileSync } from 'fs'
import { dirname, resolve } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const TRADE_LOG = resolve(__dirname, 'trade_log.jsonl')

// Load .env from workspace root
const envPath = resolve(__dirname, '../../.env')
const envContent = readFileSync(envPath, 'utf8')
for (const line of envContent.split('\n')) {
  const match = line.match(/^([^#=]+)=(.*)$/)
  if (match) process.env[match[1].trim()] = match[2].trim()
}

// Create authenticated client
export function createTrader(network = 'mainnet') {
  const networkKey = network === 'testnet' ? 'testnet4' : network
  return createHttpClient({
    network: networkKey,
    key: process.env.LNMARKETS_KEY,
    secret: process.env.LNMARKETS_SECRET,
    passphrase: process.env.LNMARKETS_PASSPHRASE
  })
}

// --- Account ---

export async function getBalance(client) {
  const account = await client.account.get()
  return {
    balance: account.balance,          // sats available
    syntheticUsd: account.syntheticUsdBalance,
    username: account.username
  }
}

// --- Deposit/Withdraw ---

export async function depositLightning(client, { amount }) {
  // Returns a Lightning invoice to pay
  return await client.account.depositLightning({ amount })
}

export async function withdrawLightning(client, { amount, invoice }) {
  return await client.account.withdrawLightning({ amount, invoice })
}

// --- Futures Trading (Isolated Margin) ---

export async function openPosition(client, { side, quantity, leverage = 1, type = 'market', price, stoploss, takeprofit }) {
  const params = { side, quantity, leverage, type }
  if (type === 'limit' && price) params.price = price
  if (stoploss) params.stoploss = stoploss
  if (takeprofit) params.takeprofit = takeprofit
  
  const trade = await client.futures.isolated.newTrade(params)
  logTrade('open', trade)
  return trade
}

export async function closePosition(client, { id }) {
  const result = await client.futures.isolated.close({ id })
  logTrade('close', result)
  return result
}

export async function getOpenPositions(client) {
  return await client.futures.isolated.getOpenTrades()
}

export async function getRunningPositions(client) {
  return await client.futures.isolated.getRunningTrades()
}

export async function getClosedPositions(client) {
  return await client.futures.isolated.getClosedTrades()
}

export async function setStopLoss(client, { id, stoploss }) {
  return await client.futures.isolated.updateStoploss({ id, stoploss })
}

export async function setTakeProfit(client, { id, takeprofit }) {
  return await client.futures.isolated.updateTakeprofit({ id, takeprofit })
}

export async function addMargin(client, { id, amount }) {
  return await client.futures.isolated.addMargin({ id, amount })
}

export async function cancelOrder(client, { id }) {
  return await client.futures.isolated.cancel({ id })
}

export async function cancelAll(client) {
  return await client.futures.isolated.cancelAll()
}

// --- Futures Trading (Cross Margin) ---

export async function crossDeposit(client, { amount }) {
  return await client.futures.cross.deposit({ amount })
}

export async function crossSetLeverage(client, { leverage }) {
  return await client.futures.cross.setLeverage({ leverage })
}

export async function crossNewOrder(client, { side, quantity, type = 'market', price }) {
  const params = { side, quantity, type }
  if (type === 'limit' && price) params.price = price
  const order = await client.futures.cross.newOrder(params)
  logTrade('cross_order', order)
  return order
}

export async function crossClose(client) {
  const result = await client.futures.cross.close()
  logTrade('cross_close', result)
  return result
}

export async function crossGetPosition(client) {
  return await client.futures.cross.getPosition()
}

// --- Trade Logging ---

function logTrade(action, data) {
  const entry = {
    timestamp: new Date().toISOString(),
    action,
    ...data
  }
  try {
    const line = JSON.stringify(entry) + '\n'
    appendFileSync(TRADE_LOG, line)
  } catch {
    // Best effort logging
  }
}

// --- Quick Status ---

export async function status(client) {
  try {
    const account = await getBalance(client)
    const running = await getRunningPositions(client)
    const open = await getOpenPositions(client)
    
    return {
      account,
      positions: {
        running: running.length,
        pending: open.length,
        details: running
      }
    }
  } catch (e) {
    return { error: e.message }
  }
}

// If run directly, show status
if (import.meta.url === `file://${process.argv[1]}`) {
  try {
    const client = createTrader(process.argv[2] || 'testnet')
    const s = await status(client)
    console.log(JSON.stringify(s, null, 2))
  } catch (e) {
    console.log('Status check failed:', e.message)
    console.log('\nEnsure LNMARKETS_KEY, LNMARKETS_SECRET, LNMARKETS_PASSPHRASE are set in .env')
  }
}
