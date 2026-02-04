#!/usr/bin/env node
// Query event from relay
import { SimplePool } from 'nostr-tools';

const eventId = process.argv[2];
if (!eventId) {
  console.error('Usage: node query-event.js <event_id>');
  process.exit(1);
}

const pool = new SimplePool();
const RELAY = 'ws://localhost:7777';

console.log('🔍 Querying event:', eventId);
console.log('📡 From relay:', RELAY);

try {
  const event = await pool.get([RELAY], { ids: [eventId] });
  
  if (event) {
    console.log('\n✅ Event found!');
    console.log('  ID:', event.id);
    console.log('  Kind:', event.kind);
    console.log('  Pubkey:', event.pubkey.slice(0, 16) + '...');
    console.log('  Created:', new Date(event.created_at * 1000).toISOString());
    console.log('  Content:', event.content);
    console.log('  Sig:', event.sig.slice(0, 16) + '...');
  } else {
    console.log('\n✗ Event not found');
  }
  
  pool.close([RELAY]);
  
} catch (error) {
  console.error('\n✗ Error:', error.message);
  pool.close([RELAY]);
  process.exit(1);
}
