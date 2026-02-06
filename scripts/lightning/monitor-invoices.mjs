#!/usr/bin/env node
/**
 * Lightning Invoice Monitor (Polling version)
 * Checks for new payments every 10 seconds
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import https from 'https';
import fs from 'fs';

const execAsync = promisify(exec);
const LNCLI = '/home/neo/lnd-linux-amd64-v0.20.0-beta/lncli';
const TELEGRAM_BOT_TOKEN = process.env.BOT_TOKEN;
const TELEGRAM_CHAT_ID = '140223355';
const STATE_FILE = '/home/neo/.openclaw/workspace/.lightning-monitor-state.json';
const POLL_INTERVAL = 10000; // 10 seconds

let lastIndex = 0;

function loadState() {
  try {
    if (fs.existsSync(STATE_FILE)) {
      const data = JSON.parse(fs.readFileSync(STATE_FILE, 'utf8'));
      lastIndex = data.lastIndex || 0;
      console.log(`Loaded state: lastIndex=${lastIndex}`);
    }
  } catch (e) {
    console.error('Error loading state:', e.message);
  }
}

function saveState() {
  try {
    fs.writeFileSync(STATE_FILE, JSON.stringify({ lastIndex, updated: Date.now() }));
  } catch (e) {
    console.error('Error saving state:', e.message);
  }
}

function sendTelegram(message) {
  const data = JSON.stringify({
    chat_id: TELEGRAM_CHAT_ID,
    text: message,
    parse_mode: 'Markdown'
  });

  const options = {
    hostname: 'api.telegram.org',
    path: `/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': data.length
    }
  };

  const req = https.request(options, (res) => {
    if (res.statusCode === 200) {
      console.log('✅ Telegram notification sent');
    }
  });

  req.on('error', (error) => {
    console.error('Telegram error:', error.message);
  });

  req.write(data);
  req.end();
}

async function checkInvoices() {
  try {
    const { stdout } = await execAsync(`${LNCLI} listinvoices --max_invoices 10`);
    const data = JSON.parse(stdout);
    
    if (!data.invoices || data.invoices.length === 0) {
      return;
    }
    
    // Check for new settled invoices
    for (const invoice of data.invoices) {
      const index = parseInt(invoice.add_index);
      
      if (index > lastIndex && invoice.state === 'SETTLED') {
        const amount = invoice.value || invoice.amt_paid_sat;
        const memo = invoice.memo || 'No memo';
        const settleDate = new Date(parseInt(invoice.settle_date) * 1000);
        const timeStr = settleDate.toISOString().replace('T', ' ').substring(0, 19);
        
        const message = `⚡ *PAGO RECIBIDO*\n\n` +
          `💰 Monto: *${amount} sats*\n` +
          `📝 Memo: ${memo}\n` +
          `⏰ ${timeStr} UTC\n` +
          `🔗 Invoice #${invoice.add_index}`;
        
        console.log(`✅ New payment: ${amount} sats (invoice #${index})`);
        sendTelegram(message);
        
        lastIndex = index;
        saveState();
      } else if (index > lastIndex) {
        lastIndex = index;
        saveState();
      }
    }
  } catch (e) {
    console.error('Error checking invoices:', e.message);
  }
}

async function main() {
  console.log('🔔 Lightning Invoice Monitor started');
  console.log(`   Polling every ${POLL_INTERVAL/1000}s`);
  console.log(`   Notifications to: ${TELEGRAM_CHAT_ID}`);
  
  loadState();
  
  // Initial check
  await checkInvoices();
  
  // Poll every 10 seconds
  setInterval(checkInvoices, POLL_INTERVAL);
}

main();
