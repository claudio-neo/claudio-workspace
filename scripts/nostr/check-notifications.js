#!/usr/bin/env node
// Check Nostr notifications: replies to my posts + mentions
// Usage: node check-notifications.js
// Output: JSON summary for heartbeat processing

import { SimplePool } from 'nostr-tools';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const KEYS_FILE = `${__dirname}/.nostr-keys.json`;
const STATE_FILE = `${__dirname}/.nostr-state.json`;

const RELAYS = [
  'wss://relay.damus.io',
  'wss://nos.lol',
  'wss://relay.nostr.band',
  'ws://localhost:7777'
];

// Load keys
const keys = JSON.parse(readFileSync(KEYS_FILE, 'utf8'));
const MY_PK = keys.publicKey;

// Load state (last check timestamp)
let state = { lastCheck: 0, seenEventIds: [] };
if (existsSync(STATE_FILE)) {
  try {
    state = JSON.parse(readFileSync(STATE_FILE, 'utf8'));
  } catch (e) {}
}

const pool = new SimplePool();

try {
  // 1. Check mentions (someone tagged me)
  const mentions = await pool.querySync(RELAYS, {
    kinds: [1],
    '#p': [MY_PK],
    since: state.lastCheck || undefined,
    limit: 20
  });
  
  // 2. Get my recent events to check for replies
  const myEvents = await pool.querySync(RELAYS, {
    kinds: [1],
    authors: [MY_PK],
    limit: 20
  });
  
  const myEventIds = myEvents.map(e => e.id);
  
  // 3. Check replies to my events
  let replies = [];
  if (myEventIds.length > 0) {
    replies = await pool.querySync(RELAYS, {
      kinds: [1],
      '#e': myEventIds,
      limit: 30
    });
  }
  
  // Filter: not from me, not already seen
  const seenSet = new Set(state.seenEventIds || []);
  
  const newMentions = mentions
    .filter(e => e.pubkey !== MY_PK && !seenSet.has(e.id))
    .sort((a, b) => b.created_at - a.created_at);
  
  const newReplies = replies
    .filter(e => e.pubkey !== MY_PK && !seenSet.has(e.id))
    .sort((a, b) => b.created_at - a.created_at);
  
  // Deduplicate (mentions can also be replies)
  const allNewIds = new Set();
  const allNew = [];
  for (const e of [...newReplies, ...newMentions]) {
    if (!allNewIds.has(e.id)) {
      allNewIds.add(e.id);
      allNew.push(e);
    }
  }
  
  // Output
  console.log(`📬 Nostr Notifications Check`);
  console.log(`   My pubkey: ${MY_PK.slice(0, 12)}...`);
  console.log(`   My events: ${myEvents.length}`);
  console.log(`   New replies: ${newReplies.length}`);
  console.log(`   New mentions: ${newMentions.length}`);
  console.log(`   Total new: ${allNew.length}`);
  console.log('');
  
  if (allNew.length === 0) {
    console.log('No new notifications.');
  } else {
    allNew.slice(0, 10).forEach((e, i) => {
      const date = new Date(e.created_at * 1000).toISOString().slice(0, 19);
      const isReply = e.tags.some(t => t[0] === 'e' && myEventIds.includes(t[1]));
      const type = isReply ? 'REPLY' : 'MENTION';
      console.log(`${i+1}. [${type}] ${date}`);
      console.log(`   From: ${e.pubkey.slice(0, 16)}...`);
      console.log(`   Content: ${e.content.slice(0, 250)}`);
      console.log(`   Event ID: ${e.id}`);
      if (isReply) {
        const replyTo = e.tags.find(t => t[0] === 'e' && myEventIds.includes(t[1]));
        console.log(`   Reply to my event: ${replyTo?.[1]?.slice(0, 16)}...`);
      }
      console.log('');
    });
  }
  
  // Update state
  const newSeenIds = [...seenSet, ...allNew.map(e => e.id)].slice(-200); // Keep last 200
  state = {
    lastCheck: Math.floor(Date.now() / 1000),
    seenEventIds: newSeenIds
  };
  writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
  
  pool.close(RELAYS);
} catch (err) {
  console.error('Error:', err.message);
  pool.close(RELAYS);
  process.exit(1);
}
