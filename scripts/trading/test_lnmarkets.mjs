// Test LN Markets API - unauthenticated endpoints
import { createHttpClient } from '@ln-markets/sdk/v3'

const client = createHttpClient()

try {
  // Server time
  const time = await client.time()
  console.log('Server time:', time)

  // Ping
  const pong = await client.ping()
  console.log('Ping:', pong)

  // Ticker
  const ticker = await client.futures.getTicket()
  console.log('BTC Ticker:', JSON.stringify(ticker, null, 2))

  // Oracle price
  const lastPrice = await client.oracle.getLastPrice()
  console.log('Oracle last price:', lastPrice)

  const index = await client.oracle.getIndex()
  console.log('Oracle index:', index)

  console.log('\n✅ LN Markets API accessible - unauthenticated endpoints work')
} catch (err) {
  console.error('Error:', err.message)
}
