#!/usr/bin/env node

const Database = require('better-sqlite3');
const { execSync } = require('child_process');

const db = new Database('/home/neo/lightning-telegram-bot/bot.db');

console.log('🔍 RECONCILIACIÓN DE CONTABILIDAD\n');

// 1. Estado LND (verdad absoluta)
console.log('═══ REALIDAD EN LND ═══');
const invoicesRaw = execSync('/home/neo/lnd-linux-amd64-v0.20.0-beta/lncli listinvoices --max_invoices=100').toString();
const paymentsRaw = execSync('/home/neo/lnd-linux-amd64-v0.20.0-beta/lncli listpayments --max_payments=100').toString();
const channelBalanceRaw = execSync('/home/neo/lnd-linux-amd64-v0.20.0-beta/lncli channelbalance').toString();

const invoicesData = JSON.parse(invoicesRaw);
const paymentsData = JSON.parse(paymentsRaw);
const channelBalance = JSON.parse(channelBalanceRaw);

const settledInvoices = invoicesData.invoices.filter(inv => inv.settled);
const succeededPayments = paymentsData.payments.filter(p => p.status === 'SUCCEEDED');

const totalDeposits = settledInvoices.reduce((sum, inv) => sum + parseInt(inv.value), 0);
const totalWithdrawals = succeededPayments.reduce((sum, p) => sum + parseInt(p.value_sat), 0);
const netLND = totalDeposits - totalWithdrawals;

console.log(`📥 Total depositado: ${totalDeposits} sats (${settledInvoices.length} invoices)`);
settledInvoices.forEach(inv => {
  console.log(`   ${inv.value} sats - ${inv.memo || 'No memo'}`);
});

console.log(`\n📤 Total retirado: ${totalWithdrawals} sats (${succeededPayments.length} payments)`);
succeededPayments.forEach(p => {
  console.log(`   ${p.value_sat} sats - hash: ${p.payment_hash.substring(0, 16)}...`);
});

console.log(`\n💰 Net esperado: ${netLND} sats`);
console.log(`💰 Balance en canales: ${channelBalance.local_balance.sat} sats`);

// 2. Estado DB
console.log('\n═══ ESTADO EN DB ═══');
const transactions = db.prepare('SELECT type, SUM(amount_sats) as total, COUNT(*) as count FROM transactions GROUP BY type').all();
console.log('Transacciones registradas:');
transactions.forEach(t => {
  console.log(`   ${t.type}: ${t.total} sats (${t.count} txs)`);
});

const users = db.prepare('SELECT telegram_id, username, balance_sats FROM users WHERE balance_sats != 0 ORDER BY balance_sats DESC').all();
const totalUserBalances = users.reduce((sum, u) => sum + u.balance_sats, 0);

console.log(`\n👥 Usuarios con balance (${users.length}):`);
users.forEach(u => {
  console.log(`   @${u.username || u.telegram_id}: ${u.balance_sats} sats`);
});
console.log(`\n💰 Total balances usuarios: ${totalUserBalances} sats`);

// 3. Discrepancias
console.log('\n═══ DISCREPANCIAS ═══');
const depositTxs = db.prepare("SELECT SUM(amount_sats) as total FROM transactions WHERE type='deposit'").get();
const withdrawalTxs = db.prepare("SELECT SUM(amount_sats) as total FROM transactions WHERE type='withdrawal'").get();

console.log(`❌ Depósitos registrados: ${depositTxs.total || 0} sats (real: ${totalDeposits} sats)`);
console.log(`❌ Retiros registrados: ${Math.abs(withdrawalTxs.total || 0)} sats (real: ${totalWithdrawals} sats)`);
console.log(`❌ Diferencia depósitos: ${totalDeposits - (depositTxs.total || 0)} sats NO registrados`);
console.log(`❌ Diferencia retiros: ${totalWithdrawals - Math.abs(withdrawalTxs.total || 0)} sats NO registrados`);

// 4. Análisis de fondos iniciales
console.log('\n═══ ANÁLISIS ═══');
console.log(`Los primeros 5500 sats (500 + 5000) fueron fondos iniciales de Daniel.`);
console.log(`Opciones:`);
console.log(`  A) Asignarlos al usuario DeltaGap (140223355)`);
console.log(`  B) Crear cuenta "BOT_RESERVE" (telegram_id = -1)`);
console.log(`  C) Distribuir proporcionalmente entre usuarios actuales`);

// 5. Propuesta de ajuste
console.log('\n═══ PROPUESTA DE AJUSTE ═══');
console.log(`
OPCIÓN RECOMENDADA: Asignar fondos iniciales a DeltaGap

1. Crear transacciones faltantes:
   - deposit 500 sats (DeltaGap) - "Fondeo inicial"
   - deposit 5000 sats (DeltaGap) - "Fondeo inicial outbound liquidity"
   - withdrawal 100 sats (quien hizo el retiro) - "Retiro no registrado"
   - withdrawal 9 sats (FCoches probablemente) - "Retiro no registrado"
   - withdrawal 8 sats (FCoches probablemente) - "Retiro no registrado"

2. Actualizar balances:
   - DeltaGap: +5500 sats
   - Usuario de los retiros: -117 sats total

3. Verificar: SUM(balances) == ${netLND} sats
`);

console.log('⚠️  REQUIERE CONFIRMACIÓN MANUAL antes de aplicar ajustes.');

db.close();
