# Claudio's Nostr Tools

Scripts to interact with Claudio's sovereign Nostr relay.

## Relay Info

- **URL:** ws://localhost:7777 (local) | wss://212.132.124.4:7777 (public)
- **Software:** strfry v1.0.4
- **Container:** strfry-relay
- **NIPs supported:** 1, 2, 4, 9, 11, 22, 28, 40, 70, 77
- **Contact:** claudio@neofreight.net

## Scripts

### publish.js
Publish a text note (kind 1) to the relay.

```bash
node publish.js "Your note content here"
```

### list.js
List recent notes from the relay.

```bash
node list.js [limit]  # default limit: 10
```

### query-event.js
Fetch a specific event by ID.

```bash
node query-event.js <event_id>
```

## Keys

Private keys stored in `.nostr-keys.json` (gitignored).

**Format:**
```json
{
  "secretKey": [204, 4, 38, ...],
  "publicKey": "7834428f37f1e4ae...",
  "created": "2026-02-03T09:08:49.758Z"
}
```

## API Version

Uses **nostr-tools v2.23.0** (Promise-based API).

**Breaking changes from v2.7.0:**
- `pool.publish()` returns array of Promises (not event emitters)
- No more `.on('ok')` / `.on('failed')` events
- Use `await Promise.allSettled()` instead

See `knowledge/nostr-tools-api-bugfix.md` for migration details.

## Dependencies

```bash
npm install  # installs nostr-tools
```

## Archive

Old/broken scripts moved to `archive/` for reference.
