#!/usr/bin/env node
// Search Nostr for recent posts on a topic
const { relayInit, SimplePool, getPublicKey, nip19 } = require('nostr-tools');

const RELAYS = [
  'wss://relay.damus.io',
  'wss://nos.lol',
  'wss://relay.nostr.band',
  'wss://nostr.wine'
];

const topic = process.argv[2] || 'bitcoin';

(async () => {
  console.log(`🔍 Searching Nostr for: "${topic}"\n`);
  
  const pool = new SimplePool();
  
  const events = await pool.querySync(RELAYS, {
    kinds: [1], // Text notes
    limit: 20,
    since: Math.floor(Date.now() / 1000) - 86400 * 2 // Last 2 days
  });
  
  const filtered = events.filter(e => 
    e.content.toLowerCase().includes(topic.toLowerCase())
  ).slice(0, 10);
  
  console.log(`Found ${filtered.length} recent posts about "${topic}":\n`);
  
  filtered.forEach((event, i) => {
    const author = event.pubkey.substring(0, 16) + '...';
    const content = event.content.substring(0, 150).replace(/\n/g, ' ');
    const date = new Date(event.created_at * 1000).toISOString();
    console.log(`[${i+1}] ${date}`);
    console.log(`    Author: ${author}`);
    console.log(`    ${content}${event.content.length > 150 ? '...' : ''}`);
    console.log(`    Event ID: ${event.id}\n`);
  });
  
  pool.close(RELAYS);
})();
