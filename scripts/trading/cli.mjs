#!/usr/bin/env node
// Trading CLI — quick commands for LN Markets
// Usage: node scripts/trading/cli.mjs <command> [args...]
//
// Commands:
//   status              Show balance + active trades
//   ticker              Show current price + funding rate
//   close <id>          Close a running trade
//   sl <id> <price>     Update stop-loss
//   tp <id> <price>     Update take-profit
//   long <qty> [lev]    Open long (market, default 1x)
//   short <qty> [lev]   Open short (market, default 1x)

import { createTrader, status, openPosition, closePosition, setStopLoss, setTakeProfit } from './trader.mjs'

const [,, cmd, ...args] = process.argv
const client = createTrader('testnet')

async function run() {
  switch (cmd) {
    case 'status': {
      const s = await status(client)
      const ticker = await client.futures.getTicket()
      console.log(`Balance: ${s.account.balance.toLocaleString()} sats`)
      console.log(`BTC: $${ticker.index.toLocaleString()} | Funding: ${ticker.fundingRate}`)
      console.log(`Running: ${s.positions.running} | Pending: ${s.positions.pending}`)
      if (s.positions.details.length > 0) {
        console.log('')
        for (const t of s.positions.details) {
          const pnlPct = (t.pl / t.entryMargin * 100).toFixed(1)
          console.log(`  ${t.id.slice(0,8)} ${t.side.toUpperCase()} $${t.quantity} @${t.entryPrice}`)
          console.log(`    PnL: ${t.pl} sats (${pnlPct}%) | SL: ${t.stoploss || '-'} | TP: ${t.takeprofit || '-'}`)
        }
      }
      break
    }
    case 'ticker': {
      const ticker = await client.futures.getTicket()
      console.log(`Index: $${ticker.index.toLocaleString()}`)
      console.log(`Last: $${ticker.lastPrice.toLocaleString()}`)
      console.log(`Funding: ${ticker.fundingRate} (next: ${ticker.fundingTime})`)
      console.log(`Spread: $${(ticker.prices[0].askPrice - ticker.prices[0].bidPrice).toFixed(1)}`)
      break
    }
    case 'close': {
      if (!args[0]) { console.log('Usage: close <trade-id>'); break }
      const result = await closePosition(client, { id: args[0] })
      console.log('Closed:', JSON.stringify(result, null, 2))
      break
    }
    case 'sl': {
      if (args.length < 2) { console.log('Usage: sl <trade-id> <price>'); break }
      const result = await setStopLoss(client, { id: args[0], stoploss: Number(args[1]) })
      console.log('Stop-loss updated:', result.stoploss)
      break
    }
    case 'tp': {
      if (args.length < 2) { console.log('Usage: tp <trade-id> <price>'); break }
      const result = await setTakeProfit(client, { id: args[0], takeprofit: Number(args[1]) })
      console.log('Take-profit updated:', result.takeprofit)
      break
    }
    case 'long':
    case 'short': {
      const qty = Number(args[0] || 10)
      const lev = Number(args[1] || 1)
      const result = await openPosition(client, { side: cmd === 'long' ? 'buy' : 'sell', quantity: qty, leverage: lev })
      console.log(`Opened ${cmd} $${qty} @${result.entryPrice} (${lev}x)`)
      console.log('ID:', result.id)
      break
    }
    default:
      console.log('Trading CLI — LN Markets (testnet4)')
      console.log('')
      console.log('Commands:')
      console.log('  status              Balance + active trades')
      console.log('  ticker              Current price + funding')
      console.log('  close <id>          Close trade')
      console.log('  sl <id> <price>     Set stop-loss')
      console.log('  tp <id> <price>     Set take-profit')
      console.log('  long <qty> [lev]    Open long')
      console.log('  short <qty> [lev]   Open short')
  }
}

run().catch(e => console.error('Error:', e.message))
