#!/usr/bin/env node
// Publish note to Claudio's Nostr relay
// Usage: node publish-note.js "content text"

import { finalizeEvent, SimplePool } from 'nostr-tools';
import { readFileSync } from 'fs';
import { dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const KEYS_FILE = `${__dirname}/../../.nostr-keys.json`;
const RELAY_URL = 'ws://localhost:7777';

// Load keys
const keys = JSON.parse(readFileSync(KEYS_FILE, 'utf8'));
// privateKey is stored as hex string, convert to Uint8Array
const sk = Uint8Array.from(Buffer.from(keys.privateKey, 'hex'));
const pk = keys.publicKey;

// Get content from command line
const content = process.argv[2];
if (!content) {
  console.error('Usage: node publish-note.js "content text"');
  process.exit(1);
}

console.log(`Publishing note as ${keys.npub.slice(0, 12)}...`);

// Create event
const event = {
  kind: 1, // Text note
  created_at: Math.floor(Date.now() / 1000),
  tags: [],
  content,
  pubkey: pk
};

// Sign event
const signedEvent = finalizeEvent(event, sk);
console.log(`✓ Event signed (${signedEvent.id.slice(0, 8)}...)`);

// Publish to relay
const pool = new SimplePool();

try {
  const result = await Promise.race([
    pool.publish([RELAY_URL], signedEvent),
    new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 10000))
  ]);
  
  console.log(`✓ Published to ${RELAY_URL}`);
  console.log(`Event ID: ${signedEvent.id}`);
  
  pool.close([RELAY_URL]);
  process.exit(0);
  
} catch (error) {
  console.error('✗ Error:', error.message);
  pool.close([RELAY_URL]);
  process.exit(1);
}
