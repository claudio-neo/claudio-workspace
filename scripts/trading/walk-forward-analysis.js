#!/usr/bin/env node
// Walk-forward analysis for trading strategy validation
// Implements rolling window optimization + out-of-sample testing

const fs = require('fs');
const path = require('path');

/**
 * Walk-forward analysis configuration
 */
const CONFIG = {
  inSampleDays: 60,      // Training period
  outSampleDays: 30,     // Testing period
  stepDays: 15,          // Roll forward interval
  minTradesPerWindow: 10 // Skip windows with insufficient data
};

/**
 * Parse trade history from CSV or JSON
 * Expected format: { timestamp, entryPrice, exitPrice, direction, outcome, pnl }
 */
function loadTradeHistory(filePath) {
  const ext = path.extname(filePath);
  const raw = fs.readFileSync(filePath, 'utf8');
  
  if (ext === '.json') {
    return JSON.parse(raw);
  } else if (ext === '.csv') {
    const lines = raw.trim().split('\n');
    const headers = lines[0].split(',');
    return lines.slice(1).map(line => {
      const values = line.split(',');
      return headers.reduce((obj, header, i) => {
        obj[header.trim()] = values[i]?.trim();
        return obj;
      }, {});
    });
  }
  throw new Error('Unsupported format. Use .json or .csv');
}

/**
 * Split trades into windows based on timestamp
 */
function createWindows(trades, config) {
  const windows = [];
  const sorted = trades.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
  
  if (sorted.length === 0) return windows;
  
  const startDate = new Date(sorted[0].timestamp);
  const endDate = new Date(sorted[sorted.length - 1].timestamp);
  const totalDays = (endDate - startDate) / (1000 * 60 * 60 * 24);
  
  let currentDay = 0;
  while (currentDay + config.inSampleDays + config.outSampleDays <= totalDays) {
    const inSampleStart = new Date(startDate.getTime() + currentDay * 24 * 60 * 60 * 1000);
    const inSampleEnd = new Date(inSampleStart.getTime() + config.inSampleDays * 24 * 60 * 60 * 1000);
    const outSampleEnd = new Date(inSampleEnd.getTime() + config.outSampleDays * 24 * 60 * 60 * 1000);
    
    const inSample = sorted.filter(t => {
      const ts = new Date(t.timestamp);
      return ts >= inSampleStart && ts < inSampleEnd;
    });
    
    const outSample = sorted.filter(t => {
      const ts = new Date(t.timestamp);
      return ts >= inSampleEnd && ts < outSampleEnd;
    });
    
    if (inSample.length >= config.minTradesPerWindow && outSample.length >= config.minTradesPerWindow) {
      windows.push({
        id: windows.length + 1,
        inSampleStart: inSampleStart.toISOString().split('T')[0],
        inSampleEnd: inSampleEnd.toISOString().split('T')[0],
        outSampleEnd: outSampleEnd.toISOString().split('T')[0],
        inSample,
        outSample
      });
    }
    
    currentDay += config.stepDays;
  }
  
  return windows;
}

/**
 * Calculate performance metrics for a set of trades
 */
function calculateMetrics(trades) {
  if (trades.length === 0) {
    return {
      tradeCount: 0,
      winRate: 0,
      avgPnL: 0,
      totalPnL: 0,
      maxDrawdown: 0,
      sharpeRatio: 0
    };
  }
  
  const wins = trades.filter(t => parseFloat(t.pnl || 0) > 0);
  const totalPnL = trades.reduce((sum, t) => sum + parseFloat(t.pnl || 0), 0);
  const avgPnL = totalPnL / trades.length;
  
  // Simple drawdown calculation (running cumulative)
  let peak = 0;
  let maxDD = 0;
  let cumulative = 0;
  trades.forEach(t => {
    cumulative += parseFloat(t.pnl || 0);
    if (cumulative > peak) peak = cumulative;
    const dd = peak - cumulative;
    if (dd > maxDD) maxDD = dd;
  });
  
  // Sharpe ratio (simplified: mean PnL / std dev PnL)
  const variance = trades.reduce((sum, t) => {
    const diff = parseFloat(t.pnl || 0) - avgPnL;
    return sum + diff * diff;
  }, 0) / trades.length;
  const stdDev = Math.sqrt(variance);
  const sharpe = stdDev > 0 ? avgPnL / stdDev : 0;
  
  return {
    tradeCount: trades.length,
    winRate: (wins.length / trades.length) * 100,
    avgPnL,
    totalPnL,
    maxDrawdown: maxDD,
    sharpeRatio: sharpe
  };
}

/**
 * Analyze degradation between in-sample and out-of-sample
 */
function analyzeDegradation(inMetrics, outMetrics) {
  const winRateDelta = outMetrics.winRate - inMetrics.winRate;
  const avgPnLDelta = outMetrics.avgPnL - inMetrics.avgPnL;
  const drawdownRatio = inMetrics.maxDrawdown > 0 ? outMetrics.maxDrawdown / inMetrics.maxDrawdown : 1;
  
  // Red flags
  const redFlags = [];
  if (winRateDelta < -20) redFlags.push('Win rate dropped >20%');
  if (inMetrics.avgPnL > 0 && outMetrics.avgPnL < 0) redFlags.push('Avg P&L turned negative OOS');
  if (drawdownRatio > 2) redFlags.push('Drawdown >2x in OOS');
  
  // Green flags
  const greenFlags = [];
  if (Math.abs(winRateDelta) <= 10) greenFlags.push('Win rate stable ±10%');
  if (inMetrics.avgPnL > 0 && outMetrics.avgPnL > 0) greenFlags.push('P&L positive in both IS and OOS');
  if (drawdownRatio <= 1.5) greenFlags.push('Drawdown similar magnitude');
  
  return {
    winRateDelta,
    avgPnLDelta,
    drawdownRatio,
    redFlags,
    greenFlags,
    verdict: redFlags.length === 0 ? 'PASS' : redFlags.length <= 1 ? 'WARNING' : 'FAIL'
  };
}

/**
 * Run walk-forward analysis
 */
function runAnalysis(tradeHistoryPath, outputPath) {
  console.log('📊 Walk-Forward Analysis\n');
  console.log(`Trade history: ${tradeHistoryPath}`);
  console.log(`Config: ${CONFIG.inSampleDays}d IS, ${CONFIG.outSampleDays}d OOS, ${CONFIG.stepDays}d step\n`);
  
  const trades = loadTradeHistory(tradeHistoryPath);
  console.log(`Loaded ${trades.length} trades\n`);
  
  const windows = createWindows(trades, CONFIG);
  console.log(`Created ${windows.length} walk-forward windows\n`);
  
  if (windows.length === 0) {
    console.log('❌ No valid windows found. Need more data or adjust config.');
    return;
  }
  
  const results = windows.map(window => {
    const inMetrics = calculateMetrics(window.inSample);
    const outMetrics = calculateMetrics(window.outSample);
    const degradation = analyzeDegradation(inMetrics, outMetrics);
    
    return {
      windowId: window.id,
      period: `${window.inSampleStart} → ${window.outSampleEnd}`,
      inSample: inMetrics,
      outSample: outMetrics,
      degradation
    };
  });
  
  // Print results
  results.forEach(r => {
    console.log(`\n=== Window ${r.windowId}: ${r.period} ===`);
    console.log(`\nIn-Sample (${r.inSample.tradeCount} trades):`);
    console.log(`  Win Rate: ${r.inSample.winRate.toFixed(1)}%`);
    console.log(`  Avg P&L: ${r.inSample.avgPnL.toFixed(2)} sats`);
    console.log(`  Total P&L: ${r.inSample.totalPnL.toFixed(0)} sats`);
    console.log(`  Max DD: ${r.inSample.maxDrawdown.toFixed(0)} sats`);
    console.log(`  Sharpe: ${r.inSample.sharpeRatio.toFixed(2)}`);
    
    console.log(`\nOut-of-Sample (${r.outSample.tradeCount} trades):`);
    console.log(`  Win Rate: ${r.outSample.winRate.toFixed(1)}% (${r.degradation.winRateDelta > 0 ? '+' : ''}${r.degradation.winRateDelta.toFixed(1)}%)`);
    console.log(`  Avg P&L: ${r.outSample.avgPnL.toFixed(2)} sats (${r.degradation.avgPnLDelta > 0 ? '+' : ''}${r.degradation.avgPnLDelta.toFixed(2)})`);
    console.log(`  Total P&L: ${r.outSample.totalPnL.toFixed(0)} sats`);
    console.log(`  Max DD: ${r.outSample.maxDrawdown.toFixed(0)} sats (${r.degradation.drawdownRatio.toFixed(2)}x)`);
    console.log(`  Sharpe: ${r.outSample.sharpeRatio.toFixed(2)}`);
    
    console.log(`\nVerdict: ${r.degradation.verdict}`);
    if (r.degradation.redFlags.length > 0) {
      console.log(`❌ Red flags: ${r.degradation.redFlags.join(', ')}`);
    }
    if (r.degradation.greenFlags.length > 0) {
      console.log(`✅ Green flags: ${r.degradation.greenFlags.join(', ')}`);
    }
  });
  
  // Summary
  const passCount = results.filter(r => r.degradation.verdict === 'PASS').length;
  const warningCount = results.filter(r => r.degradation.verdict === 'WARNING').length;
  const failCount = results.filter(r => r.degradation.verdict === 'FAIL').length;
  
  console.log(`\n\n=== SUMMARY ===`);
  console.log(`Total windows: ${results.length}`);
  console.log(`PASS: ${passCount} | WARNING: ${warningCount} | FAIL: ${failCount}`);
  console.log(`Success rate: ${((passCount / results.length) * 100).toFixed(1)}%`);
  
  // Save to file
  if (outputPath) {
    fs.writeFileSync(outputPath, JSON.stringify(results, null, 2));
    console.log(`\n💾 Results saved to ${outputPath}`);
  }
}

// CLI interface
if (require.main === module) {
  const args = process.argv.slice(2);
  if (args.length < 1) {
    console.log('Usage: node walk-forward-analysis.js <trade-history.json|csv> [output.json]');
    console.log('\nExample:');
    console.log('  node walk-forward-analysis.js trades.json results.json');
    process.exit(1);
  }
  
  const inputPath = args[0];
  const outputPath = args[1] || null;
  
  if (!fs.existsSync(inputPath)) {
    console.error(`Error: File not found: ${inputPath}`);
    process.exit(1);
  }
  
  runAnalysis(inputPath, outputPath);
}

module.exports = { runAnalysis, calculateMetrics, createWindows };
