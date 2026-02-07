#!/usr/bin/env node
/**
 * Lightning Bot Dashboard Server
 * Centro de mandos para administración y debugging
 */

import express from 'express';
import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.DASHBOARD_PORT || 8091;

// Open database (read-only for safety)
const db = new Database(join(__dirname, '../bot.db'), { readonly: true });

// Basic Auth middleware
const DASHBOARD_USER = process.env.DASHBOARD_USER || 'admin';
const DASHBOARD_PASS = process.env.DASHBOARD_PASS || 'calamardo2024';

function requireAuth(req, res, next) {
  const auth = req.headers.authorization;
  
  if (!auth || !auth.startsWith('Basic ')) {
    res.setHeader('WWW-Authenticate', 'Basic realm="Lightning Dashboard"');
    return res.status(401).send('Authentication required');
  }
  
  const credentials = Buffer.from(auth.slice(6), 'base64').toString();
  const [username, password] = credentials.split(':');
  
  if (username === DASHBOARD_USER && password === DASHBOARD_PASS) {
    return next();
  }
  
  res.setHeader('WWW-Authenticate', 'Basic realm="Lightning Dashboard"');
  return res.status(401).send('Invalid credentials');
}

// Auth handled by Caddy, trust X-Forwarded-User header
app.use(express.static(join(__dirname, 'public'), {
  setHeaders: (res, path) => {
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
  }
}));

// === API ENDPOINTS ===

// Dashboard stats
app.get('/api/stats', (req, res) => {
  try {
    const stats = {
      totalUsers: db.prepare('SELECT COUNT(*) as count FROM users WHERE telegram_id > 0').get().count,
      totalBalance: db.prepare('SELECT COALESCE(SUM(balance_sats), 0) as total FROM users WHERE telegram_id > 0').get().total,
      totalTransactions: db.prepare('SELECT COUNT(*) as count FROM transactions').get().count,
      totalDeposits: db.prepare("SELECT COALESCE(SUM(amount_sats), 0) as total FROM transactions WHERE type = 'deposit'").get().total,
      totalWithdrawals: db.prepare("SELECT COALESCE(SUM(amount_sats), 0) as total FROM transactions WHERE type = 'withdrawal'").get().total,
      totalCapital: db.prepare("SELECT COALESCE(SUM(amount_sats), 0) as total FROM transactions WHERE type = 'capital'").get().total,
      totalTips: db.prepare("SELECT COALESCE(SUM(amount_sats), 0) as total FROM transactions WHERE type = 'tip'").get().total,
      totalFees: db.prepare('SELECT COALESCE(SUM(fee_sats), 0) as total FROM transactions').get().total,
      pendingInvoices: db.prepare('SELECT COUNT(*) as count FROM pending_invoices').get().count,
      activeGroups: db.prepare('SELECT COUNT(*) as count FROM group_configs WHERE enabled = 1').get().count,
      botReserve: db.prepare('SELECT COALESCE(balance_sats, 0) as total FROM users WHERE telegram_id = -1').get().total,
    };
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Recent transactions
app.get('/api/transactions/recent', (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    const transactions = db.prepare(`
      SELECT 
        t.*,
        u.username,
        datetime(t.created_at, 'unixepoch') as created_at_formatted
      FROM transactions t
      LEFT JOIN users u ON t.telegram_id = u.telegram_id
      ORDER BY t.id DESC
      LIMIT ?
    `).all(limit);
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// User balances
app.get('/api/users', (req, res) => {
  try {
    const users = db.prepare(`
      SELECT 
        telegram_id,
        username,
        balance_sats,
        role,
        locale,
        datetime(created_at, 'unixepoch') as created_at_formatted,
        (SELECT COUNT(*) FROM transactions WHERE telegram_id = users.telegram_id) as tx_count
      FROM users
      ORDER BY balance_sats DESC
    `).all();
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// User detail + history
app.get('/api/users/:telegramId', (req, res) => {
  try {
    const telegramId = req.params.telegramId;
    const user = db.prepare(`
      SELECT 
        telegram_id,
        username,
        balance_sats,
        role,
        locale,
        datetime(created_at, 'unixepoch') as created_at_formatted
      FROM users
      WHERE telegram_id = ?
    `).get(telegramId);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const transactions = db.prepare(`
      SELECT 
        *,
        datetime(created_at, 'unixepoch') as created_at_formatted
      FROM transactions
      WHERE telegram_id = ?
      ORDER BY created_at DESC
    `).all(telegramId);
    
    res.json({ user, transactions });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Activity logs (last 1000 lines)
app.get('/api/logs/activity', (req, res) => {
  try {
    const logPath = join(__dirname, '../activity.log');
    const log = fs.readFileSync(logPath, 'utf-8');
    const lines = log.split('\n').filter(l => l.trim()).slice(-1000);
    res.json({ lines });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Bot logs (last 1000 lines)
app.get('/api/logs/bot', (req, res) => {
  try {
    const logPath = join(__dirname, '../bot.log');
    const log = fs.readFileSync(logPath, 'utf-8');
    const lines = log.split('\n').filter(l => l.trim()).slice(-1000);
    res.json({ lines });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Pending invoices
app.get('/api/invoices/pending', (req, res) => {
  try {
    const invoices = db.prepare(`
      SELECT 
        p.*,
        u.username,
        datetime(p.created_at, 'unixepoch') as created_at_formatted
      FROM pending_invoices p
      LEFT JOIN users u ON p.telegram_id = u.telegram_id
      ORDER BY p.created_at DESC
    `).all();
    res.json(invoices);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Group configs
app.get('/api/groups', (req, res) => {
  try {
    const groups = db.prepare(`
      SELECT 
        g.*,
        u.username as owner_username,
        datetime(g.created_at, 'unixepoch') as created_at_formatted
      FROM group_configs g
      LEFT JOIN users u ON g.owner_telegram_id = u.telegram_id
      ORDER BY g.created_at DESC
    `).all();
    res.json(groups);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Support messages
app.get('/api/support', (req, res) => {
  try {
    const messages = db.prepare(`
      SELECT 
        *,
        datetime(created_at, 'unixepoch') as created_at_formatted
      FROM support_messages
      ORDER BY created_at DESC
    `).all();
    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Swap requests
app.get('/api/swaps', (req, res) => {
  try {
    const swaps = db.prepare(`
      SELECT 
        *,
        datetime(created_at, 'unixepoch') as created_at_formatted,
        datetime(completed_at, 'unixepoch') as completed_at_formatted
      FROM swap_requests
      ORDER BY created_at DESC
    `).all();
    res.json(swaps);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Start server
app.listen(PORT, '127.0.0.1', () => {
  console.log(`✅ Lightning Bot Dashboard running on http://127.0.0.1:${PORT}`);
  console.log(`   User: ${DASHBOARD_USER}`);
  console.log(`   Pass: ${DASHBOARD_PASS}`);
});
