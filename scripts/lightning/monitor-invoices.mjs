#!/usr/bin/env node
/**
 * Lightning Invoice Monitor
 * Escucha eventos de LND y notifica vía Telegram
 */

import { spawn } from 'child_process';
import https from 'https';

const LNCLI = '/home/neo/lnd-linux-amd64-v0.20.0-beta/lncli';
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || process.env.BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_ADMIN_ID || '140223355';

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
    console.log(`Telegram notification sent: ${res.statusCode}`);
  });

  req.on('error', (error) => {
    console.error('Telegram error:', error.message);
  });

  req.write(data);
  req.end();
}

function monitorInvoices() {
  console.log('🔔 Starting Lightning invoice monitor...');
  console.log(`   Notifications to Telegram: ${TELEGRAM_CHAT_ID}`);
  
  const lncli = spawn(LNCLI, ['subscribeinvoices']);
  
  let buffer = '';
  
  lncli.stdout.on('data', (data) => {
    buffer += data.toString();
    
    // Process complete JSON objects
    const lines = buffer.split('\n');
    buffer = lines.pop(); // Keep incomplete line in buffer
    
    for (const line of lines) {
      if (!line.trim()) continue;
      
      try {
        const invoice = JSON.parse(line);
        
        if (invoice.state === 'SETTLED') {
          const amount = invoice.value || invoice.amt_paid_sat;
          const memo = invoice.memo || 'No memo';
          const settleDate = new Date(invoice.settle_date * 1000).toISOString();
          
          const message = `⚡ *PAGO RECIBIDO*\n\n` +
            `💰 Monto: *${amount} sats*\n` +
            `📝 Memo: ${memo}\n` +
            `⏰ ${settleDate}\n` +
            `🔗 Invoice #${invoice.add_index}`;
          
          console.log(`✅ Invoice settled: ${amount} sats`);
          sendTelegram(message);
        }
        
        if (invoice.state === 'CANCELED') {
          console.log(`❌ Invoice canceled: ${invoice.add_index}`);
        }
      } catch (e) {
        // Ignore JSON parse errors for incomplete data
      }
    }
  });
  
  lncli.stderr.on('data', (data) => {
    console.error('lncli error:', data.toString());
  });
  
  lncli.on('close', (code) => {
    console.log(`lncli exited with code ${code}`);
    // Restart after 5 seconds
    setTimeout(() => {
      console.log('Restarting monitor...');
      monitorInvoices();
    }, 5000);
  });
}

// Start monitoring
monitorInvoices();
