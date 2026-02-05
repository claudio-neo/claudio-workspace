#!/usr/bin/env node
// Reply to a Nostr note
// Usage: node reply.js <event_id> "Your reply content"
// Publishes to our relay + public relays

import { finalizeEvent, SimplePool } from 'nostr-tools';
import { readFileSync } from 'fs';
import { dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const KEYS_FILE = `${__dirname}/.nostr-keys.json`;

const RELAYS = [
  'ws://localhost:7777',
  'wss://relay.damus.io',
  'wss://nos.lol',
  'wss://relay.nostr.band'
];

// Load keys
const keys = JSON.parse(readFileSync(KEYS_FILE, 'utf8'));
const sk = new Uint8Array(keys.secretKey);
const pk = keys.publicKey;

const eventId = process.argv[2];
const content = process.argv[3];

if (!eventId || !content) {
  console.error('Usage: node reply.js <event_id> "Your reply content"');
  process.exit(1);
}

console.log(`💬 Replying to ${eventId.slice(0, 16)}...`);

const pool = new SimplePool();

try {
  // First, fetch the original event to get the author's pubkey and thread info
  const original = await pool.get(RELAYS, { ids: [eventId] });
  
  if (!original) {
    console.error('❌ Could not find original event');
    process.exit(1);
  }
  
  console.log(`   Original by: ${original.pubkey.slice(0, 12)}...`);
  console.log(`   Content: ${original.content.slice(0, 80)}...`);
  
  // Build reply tags (NIP-10)
  const tags = [
    ['e', eventId, '', 'reply'],       // Reply to this event
    ['p', original.pubkey]              // Tag the author
  ];
  
  // If the original was itself a reply, include the root
  const rootTag = original.tags.find(t => t[0] === 'e' && t[3] === 'root');
  if (rootTag) {
    tags.unshift(['e', rootTag[1], rootTag[2] || '', 'root']);
  } else {
    // The original IS the root
    tags.unshift(['e', eventId, '', 'root']);
  }
  
  // Create and sign reply event
  const event = {
    kind: 1,
    created_at: Math.floor(Date.now() / 1000),
    tags,
    content,
    pubkey: pk
  };
  
  const signedEvent = finalizeEvent(event, sk);
  console.log(`✓ Reply signed: ${signedEvent.id.slice(0, 16)}...`);
  
  // Publish to all relays
  const promises = pool.publish(RELAYS, signedEvent);
  const results = await Promise.allSettled(promises);
  
  let successCount = 0;
  results.forEach((result) => {
    if (result.status === 'fulfilled') successCount++;
  });
  
  console.log(`\n✅ Published to ${successCount}/${RELAYS.length} relays`);
  console.log(`   Event ID: ${signedEvent.id}`);
  
  pool.close(RELAYS);
} catch (error) {
  console.error('Error:', error.message);
  pool.close(RELAYS);
  process.exit(1);
}
