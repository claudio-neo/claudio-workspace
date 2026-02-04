#!/usr/bin/env node
// List recent notes from relay

import { SimplePool } from 'nostr-tools';

const RELAY_URL = 'ws://localhost:7777';

console.log(`Fetching recent notes from ${RELAY_URL}...\n`);

const pool = new SimplePool();

try {
  const events = await Promise.race([
    pool.querySync([RELAY_URL], { kinds: [1], limit: 20 }),
    new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 10000))
  ]);
  
  console.log(`Found ${events.length} notes:\n`);
  
  events.sort((a, b) => b.created_at - a.created_at).forEach((event, i) => {
    const date = new Date(event.created_at * 1000).toISOString();
    const preview = event.content.split('\n')[0].slice(0, 80);
    console.log(`${i + 1}. [${date}] ${event.pubkey.slice(0, 8)}...`);
    console.log(`   ${preview}${event.content.length > 80 ? '...' : ''}`);
    console.log(`   ID: ${event.id.slice(0, 16)}...\n`);
  });
  
  pool.close([RELAY_URL]);
  process.exit(0);
  
} catch (error) {
  console.error('✗ Error:', error.message);
  pool.close([RELAY_URL]);
  process.exit(1);
}
