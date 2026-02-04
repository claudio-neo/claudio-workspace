#!/usr/bin/env node
// Publish note to Claudio's Nostr relay
// Usage: node publish.js "Your note content here"
// Fixed for nostr-tools v2.x API (Promises, not events)

import { finalizeEvent, SimplePool } from 'nostr-tools';
import { readFileSync } from 'fs';
import { dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const KEYS_FILE = `${__dirname}/.nostr-keys.json`;
const RELAY_URL = 'ws://localhost:7777';

// Load keys
const keys = JSON.parse(readFileSync(KEYS_FILE, 'utf8'));
const sk = new Uint8Array(keys.secretKey);
const pk = keys.publicKey;

// Get content from command line
const content = process.argv[2];
if (!content) {
  console.error('Usage: node publish.js "Your note content here"');
  process.exit(1);
}

console.log(`📝 Publishing as npub1...${pk.slice(-8)}`);

// Create and sign event
const event = {
  kind: 1,
  created_at: Math.floor(Date.now() / 1000),
  tags: [],
  content,
  pubkey: pk
};

const signedEvent = finalizeEvent(event, sk);
console.log(`✓ Event signed: ${signedEvent.id.slice(0, 16)}...`);

// Publish to relay
const pool = new SimplePool();

try {
  const promises = pool.publish([RELAY_URL], signedEvent);
  const results = await Promise.allSettled(promises);
  
  let success = false;
  results.forEach((result, i) => {
    if (result.status === 'fulfilled') {
      console.log(`✓ Relay accepted event`);
      success = true;
    } else {
      console.log(`✗ Relay rejected: ${result.reason}`);
    }
  });
  
  pool.close([RELAY_URL]);
  
  if (success) {
    console.log(`\n✅ Published successfully!`);
    console.log(`   Event ID: ${signedEvent.id}`);
    console.log(`   Relay: ${RELAY_URL}`);
    process.exit(0);
  } else {
    console.error('\n❌ All relays rejected the event');
    process.exit(1);
  }
  
} catch (error) {
  console.error('\n✗ Error:', error.message);
  pool.close([RELAY_URL]);
  process.exit(1);
}
