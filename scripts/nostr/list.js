#!/usr/bin/env node
// List recent notes from Claudio's Nostr relay
// Usage: node list.js [limit]

import { SimplePool } from 'nostr-tools';

const RELAY_URL = 'ws://localhost:7777';
const limit = parseInt(process.argv[2]) || 10;

console.log(`🔍 Fetching ${limit} most recent notes from relay...`);

const pool = new SimplePool();

try {
  // Query for recent text notes (kind 1)
  const events = await pool.querySync([RELAY_URL], {
    kinds: [1],
    limit: limit
  });
  
  if (events.length === 0) {
    console.log('No notes found.');
  } else {
    console.log(`\nFound ${events.length} note(s):\n`);
    
    events
      .sort((a, b) => b.created_at - a.created_at)
      .forEach((event, i) => {
        const date = new Date(event.created_at * 1000);
        const pubkeyShort = event.pubkey.slice(0, 8) + '...' + event.pubkey.slice(-8);
        
        console.log(`${i + 1}. [${date.toISOString()}]`);
        console.log(`   Author: ${pubkeyShort}`);
        console.log(`   Content: ${event.content}`);
        console.log(`   ID: ${event.id.slice(0, 16)}...`);
        console.log('');
      });
  }
  
  pool.close([RELAY_URL]);
  
} catch (error) {
  console.error('✗ Error:', error.message);
  pool.close([RELAY_URL]);
  process.exit(1);
}
