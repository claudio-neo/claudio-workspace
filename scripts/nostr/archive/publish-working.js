#!/usr/bin/env node
// Working Nostr publish script for nostr-tools v2.x
import { finalizeEvent, SimplePool } from 'nostr-tools';
import { readFileSync } from 'fs';

const keys = JSON.parse(readFileSync('.nostr-keys.json', 'utf8'));
const sk = new Uint8Array(keys.secretKey);

const content = process.argv[2] || "🔍 Test note from Claudio - " + new Date().toISOString();

const event = {
  kind: 1,
  created_at: Math.floor(Date.now() / 1000),
  tags: [],
  content,
  pubkey: keys.publicKey
};

const signed = finalizeEvent(event, sk);
console.log('✓ Event signed:', signed.id);

const pool = new SimplePool();
const RELAY = 'ws://localhost:7777';

console.log('📡 Publishing to', RELAY);

try {
  const promises = pool.publish([RELAY], signed);
  console.log(`  Waiting for ${promises.length} relay(s)...`);
  
  // Wait for all relays to respond
  const results = await Promise.allSettled(promises);
  
  results.forEach((result, i) => {
    if (result.status === 'fulfilled') {
      console.log(`  ✓ Relay ${i+1}: Event accepted`);
    } else {
      console.log(`  ✗ Relay ${i+1}: ${result.reason}`);
    }
  });
  
  pool.close([RELAY]);
  console.log('\n✅ Done! Event ID:', signed.id);
  
} catch (error) {
  console.error('\n✗ Error:', error.message);
  pool.close([RELAY]);
  process.exit(1);
}
