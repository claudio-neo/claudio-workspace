import { finalizeEvent, SimplePool } from 'nostr-tools';
import { readFileSync } from 'fs';

const keys = JSON.parse(readFileSync('../../.nostr-keys.json', 'utf8'));
const sk = Uint8Array.from(Buffer.from(keys.privateKey, 'hex'));

const event = {
  kind: 1,
  created_at: Math.floor(Date.now() / 1000),
  tags: [],
  content: "🌙 Nightshift Bitcoin scripting analysis complete! Taproot: 42.6% of mainnet outputs. #bitcoin",
  pubkey: keys.publicKey
};

const signed = finalizeEvent(event, sk);
console.log('Signed event:', signed.id);

const pool = new SimplePool();
const pubs = pool.publish(['ws://localhost:7777'], signed);

pubs.forEach(pub => {
  pub.on('ok', () => console.log('✓ Relay accepted'));
  pub.on('failed', reason => console.log('✗ Relay rejected:', reason));
});

setTimeout(() => {
  pool.close(['ws://localhost:7777']);
  process.exit(0);
}, 3000);
