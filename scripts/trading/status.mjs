// Quick trading status check — run with: node --input-type=module scripts/trading/status.mjs
import { createHttpClient } from '@ln-markets/sdk/v3'
import { readFileSync } from 'fs'

const creds = JSON.parse(readFileSync('.lnmarkets_creds.json', 'utf8'));
const client = createHttpClient({
  network: 'testnet4',
  key: creds.key,
  secret: creds.secret,
  passphrase: creds.passphrase
});

const acc = await client.account.get();
const ticker = await client.futures.getTicket();
const running = await client.futures.isolated.getRunningTrades();
const open = await client.futures.isolated.getOpenTrades();

console.log('=== LN Markets Status ===');
console.log(`Balance: ${acc.balance.toLocaleString()} sats`);
console.log(`BTC: $${ticker.index.toLocaleString()}`);
console.log(`Funding rate: ${ticker.fundingRate}`);
console.log('');

if (running.length === 0 && open.length === 0) {
  console.log('No active trades.');
} else {
  if (running.length > 0) {
    console.log(`Running trades: ${running.length}`);
    running.forEach(t => {
      const pnlPct = (t.pl / t.entryMargin * 100).toFixed(1);
      const pricePct = ((ticker.index - t.entryPrice) / t.entryPrice * 100).toFixed(2);
      console.log(`  ${t.side.toUpperCase()} $${t.quantity} @${t.entryPrice} → $${ticker.index} (${pricePct}%)`);
      console.log(`  PnL: ${t.pl} sats (${pnlPct}% on margin) | Lev: ${t.leverage}x`);
      console.log(`  SL: ${t.stoploss || 'none'} | TP: ${t.takeprofit || 'none'} | Liq: ${t.liquidation}`);
    });
  }
  if (open.length > 0) {
    console.log(`\nOpen orders: ${open.length}`);
    open.forEach(o => {
      console.log(`  ${o.side.toUpperCase()} $${o.quantity} @${o.price} (${o.type})`);
    });
  }
}
