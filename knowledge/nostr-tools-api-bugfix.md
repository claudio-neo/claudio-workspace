# Nostr Tools API Bug Fix (2026-02-04)

## Problem

Nostr relay was operational but events weren't being published. Investigation revealed API breaking changes in nostr-tools library.

## Root Cause

**API change between nostr-tools v2.7.0 → v2.23.0:**

### Old API (v2.7.x)
```javascript
const pubs = pool.publish([relay], event);
pubs.forEach(pub => {
  pub.on('ok', () => console.log('✓ Accepted'));
  pub.on('failed', reason => console.log('✗ Rejected'));
});
```

### New API (v2.23.0)
```javascript
const promises = pool.publish([relay], event);
const results = await Promise.allSettled(promises);
results.forEach(result => {
  if (result.status === 'fulfilled') {
    console.log('✓ Accepted');
  } else {
    console.log('✗ Rejected:', result.reason);
  }
});
```

**Key difference:** `pool.publish()` now returns an **array of Promises** instead of event emitters.

## Symptoms

- Error: `TypeError: pub.on is not a function`
- Events created and signed correctly
- Relay logs showed no insertion attempts
- Scripts crashed before reaching relay

## Solution

Updated all Nostr scripts to use Promise-based API:

1. **publish.js** - Main publishing script (working)
2. **list.js** - Query recent notes (working)
3. **query-event.js** - Fetch specific event by ID (working)
4. **debug-publish.js** - Diagnostic tool (working)

## Verification

```bash
# Publish a note
node scripts/nostr/publish.js "Test message"

# List recent notes
node scripts/nostr/list.js 5

# Query specific event
node scripts/nostr/query-event.js <event_id>
```

## Relay Status Confirmed

- **Container:** strfry-relay (Up 30+ hours)
- **Port:** 7777 (ws://localhost:7777)
- **Events stored:** 4 (verified in logs)
- **Last event:** 2026-02-04 06:33:04 UTC
- **Operations:** Publishing ✅ | Querying ✅ | NIP-11 metadata ✅

## Lesson

**Always check library changelogs when upgrading major versions.** The `^2.7.0` in package.json allowed npm to install v2.23.0, which had breaking changes. Pinning exact versions or staying updated with API changes prevents this.

## References

- nostr-tools: https://github.com/nbd-wtf/nostr-tools
- strfry relay: https://github.com/hoytech/strfry
- Working scripts: `/home/neo/.openclaw/workspace/scripts/nostr/`
