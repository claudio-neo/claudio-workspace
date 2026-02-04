#!/usr/bin/env node
// Debug nostr-tools SimplePool.publish() API
import { finalizeEvent, SimplePool } from 'nostr-tools';
import { readFileSync } from 'fs';

const keys = JSON.parse(readFileSync('.nostr-keys.json', 'utf8'));
const sk = new Uint8Array(keys.secretKey);

const event = {
  kind: 1,
  created_at: Math.floor(Date.now() / 1000),
  tags: [],
  content: "🔍 Testing Nostr API - " + new Date().toISOString(),
  pubkey: keys.publicKey
};

const signed = finalizeEvent(event, sk);
console.log('✓ Event signed:', signed.id.slice(0, 16) + '...');
console.log('  Pubkey:', signed.pubkey.slice(0, 16) + '...');
console.log('  Content:', signed.content);

const pool = new SimplePool();
const RELAY = 'ws://localhost:7777';

console.log('\n📡 Publishing to relay:', RELAY);

try {
  const result = pool.publish([RELAY], signed);
  console.log('\n🔍 pool.publish() returned:');
  console.log('  Type:', typeof result);
  console.log('  Constructor:', result?.constructor?.name);
  console.log('  Keys:', Object.keys(result || {}));
  console.log('  Value:', result);
  
  // Try different approaches
  if (result && typeof result.then === 'function') {
    console.log('\n⏳ Looks like a Promise, awaiting...');
    const promiseResult = await result;
    console.log('  Promise resolved with:', promiseResult);
  } else if (Array.isArray(result)) {
    console.log('\n📋 It\'s an array with', result.length, 'items');
    result.forEach((item, i) => {
      console.log(`  [${i}] type:`, typeof item, 'constructor:', item?.constructor?.name);
      console.log(`  [${i}] methods:`, Object.getOwnPropertyNames(Object.getPrototypeOf(item || {})));
    });
  }
  
  // Wait for any async operations
  await new Promise(resolve => setTimeout(resolve, 2000));
  
} catch (error) {
  console.error('\n✗ Error:', error.message);
  console.error('  Stack:', error.stack);
}

pool.close([RELAY]);
console.log('\n✓ Pool closed');
