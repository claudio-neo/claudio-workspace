#!/usr/bin/env node
const crypto = require('crypto');
const https = require('https');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const API_KEY = process.env.LNMARKETS_KEY;
const API_SECRET = process.env.LNMARKETS_SECRET;
const PASSPHRASE = process.env.LNMARKETS_PASSPHRASE;
const BASE_URL = 'api.testnet4.lnmarkets.com'; // TESTNET4

if (!API_KEY || !API_SECRET || !PASSPHRASE) {
  console.error('❌ Missing credentials');
  process.exit(1);
}

function getAuthHeaders(method, endpoint, body = '') {
  const timestamp = Date.now().toString();
  const message = timestamp + method + endpoint + body;
  const signature = crypto
    .createHmac('sha256', Buffer.from(API_SECRET, 'base64'))
    .update(message)
    .digest('base64');

  return {
    'Content-Type': 'application/json',
    'LNM-ACCESS-KEY': API_KEY,
    'LNM-ACCESS-PASSPHRASE': PASSPHRASE,
    'LNM-ACCESS-SIGNATURE': signature,
    'LNM-ACCESS-TIMESTAMP': timestamp
  };
}

function makeRequest(method, endpoint, body = null) {
  return new Promise((resolve, reject) => {
    const bodyStr = body ? JSON.stringify(body) : '';
    const headers = getAuthHeaders(method, endpoint, bodyStr);

    const options = {
      hostname: BASE_URL,
      path: endpoint,
      method: method,
      headers: headers
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          try {
            resolve(JSON.parse(data));
          } catch (e) {
            resolve(data);
          }
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${data}`));
        }
      });
    });

    req.on('error', reject);
    if (bodyStr) req.write(bodyStr);
    req.end();
  });
}

async function exportHistory() {
  console.log('📊 Exporting LN Markets (testnet4) history...\n');

  try {
    // Test connection with ticker (public endpoint)
    console.log('0. Testing connection...');
    const publicReq = https.request({
      hostname: BASE_URL,
      path: '/v2/futures/ticker',
      method: 'GET'
    }, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => console.log(`   ✅ API reachable (HTTP ${res.statusCode})\n`));
    });
    publicReq.end();

    await new Promise(resolve => setTimeout(resolve, 500));

    // Get account
    console.log('1. Fetching account info...');
    const account = await makeRequest('GET', '/v2/user');
    console.log(`   Balance: ${account.balance} sats`);
    console.log(`   PNL: ${account.pnl || 0} sats\n`);

    // Get trade history
    console.log('2. Fetching trade history...');
    const trades = await makeRequest('GET', '/v2/futures/history/trades');
    console.log(`   Found ${trades.length} trades\n`);

    // Get positions
    console.log('3. Fetching position history...');
    const positions = await makeRequest('GET', '/v2/futures/history');
    console.log(`   Found ${positions.length} positions\n`);

    // Save data
    const timestamp = new Date().toISOString().split('T')[0];
    const outputDir = path.join(__dirname, '../../data/trading');
    
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const dataFile = path.join(outputDir, `lnmarkets-export-${timestamp}.json`);
    const exportData = {
      exported_at: new Date().toISOString(),
      network: 'testnet4',
      account: account,
      trades: trades,
      positions: positions
    };

    fs.writeFileSync(dataFile, JSON.stringify(exportData, null, 2));
    console.log(`✅ Exported to: ${dataFile}`);
    console.log(`   Size: ${(fs.statSync(dataFile).size / 1024).toFixed(2)} KB\n`);

    // Stats
    if (trades.length > 0) {
      const totalPnl = trades.reduce((sum, t) => sum + (t.pnl || 0), 0);
      const wins = trades.filter(t => (t.pnl || 0) > 0).length;
      const losses = trades.filter(t => (t.pnl || 0) < 0).length;
      
      console.log('📈 Summary:');
      console.log(`   Trades: ${trades.length}`);
      console.log(`   Wins: ${wins} | Losses: ${losses}`);
      console.log(`   Win rate: ${((wins/trades.length)*100).toFixed(1)}%`);
      console.log(`   Total PNL: ${totalPnl} sats`);
    }

  } catch (error) {
    console.error('❌ Failed:', error.message);
    process.exit(1);
  }
}

exportHistory();
