#!/usr/bin/env node
// Browse Nostr feeds from public relays
// Usage: node browse-feed.js [search_term] [limit]

import { SimplePool } from 'nostr-tools';

const PUBLIC_RELAYS = [
  'wss://relay.damus.io',
  'wss://nos.lol',
  'wss://relay.nostr.band',
  'wss://relay.snort.social',
  'ws://localhost:7777'  // Our relay too
];

const searchTerm = process.argv[2] || '';
const limit = parseInt(process.argv[3]) || 20;

console.log(`🔍 Browsing Nostr feed...`);
if (searchTerm) console.log(`Search: "${searchTerm}"`);
console.log(`Relays: ${PUBLIC_RELAYS.length}`);
console.log('');

const pool = new SimplePool();

try {
  // Query for recent text notes (kind 1)
  const filter = {
    kinds: [1],
    limit: limit
  };
  
  // Fetch more if filtering locally
  if (searchTerm) {
    filter.limit = 500;  // Fetch more to filter locally
  }

  const events = await pool.querySync(PUBLIC_RELAYS, filter);
  
  if (events.length === 0) {
    console.log('No notes found.');
  } else {
    // Deduplicate by event ID
    const seen = new Set();
    const unique = events.filter(e => {
      if (seen.has(e.id)) return false;
      seen.add(e.id);
      return true;
    });
    
    // Filter by search term in content if NIP-50 not supported
    let filtered = unique;
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = unique.filter(e => 
        e.content.toLowerCase().includes(term)
      );
    }
    
    // Sort by time
    filtered.sort((a, b) => b.created_at - a.created_at);
    
    console.log(`Found ${filtered.length} note(s):\n`);
    
    filtered.slice(0, limit).forEach((event, i) => {
      const date = new Date(event.created_at * 1000);
      const pubkey = event.pubkey.slice(0, 12) + '...';
      const content = event.content.replace(/\n/g, ' ').slice(0, 200);
      const replyTo = event.tags.find(t => t[0] === 'e');
      const isReply = replyTo ? ' [reply]' : '';
      
      console.log(`${i+1}. [${date.toISOString().slice(0,19)}] ${pubkey}${isReply}`);
      console.log(`   ${content}`);
      console.log(`   ID: ${event.id.slice(0,16)}`);
      console.log('');
    });
  }
  
  pool.close(PUBLIC_RELAYS);
} catch (error) {
  console.error('Error:', error.message);
  pool.close(PUBLIC_RELAYS);
  process.exit(1);
}
