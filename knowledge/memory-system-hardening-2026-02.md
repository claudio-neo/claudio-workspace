# Memory System Hardening (OpenClaw 2026.2.6)

**Study Date:** 2026-02-08 02:30 UTC (Nightshift)  
**Motivation:** 5 upstream commits focused on memory reliability  
**Upstream Commits:** ce715c4c5, 0d60ef6fe, c741d008d, 6f1ba986b, 95263f4e6

---

## Context: Why Memory Hardening Matters

**My use case:**
- **Nightshift sessions** (isolated, 1h autonomous work)
- **Main session** (direct chat with Daniel)
- **Cron jobs** (automated tasks, conversation backups)
- **All access memory files simultaneously** → race conditions possible

**Without hardening:** SQLITE_BUSY errors → lost memory updates, crashes  
**With hardening:** Graceful queueing, fallback mechanisms, safe concurrent access

---

## OpenClaw Memory Architecture

### Memory Layers
1. **Markdown files** (source of truth):
   - `memory/YYYY-MM-DD.md` — daily logs (append-only)
   - `MEMORY.md` — curated long-term memory (main session only)
   
2. **QMD (Quantized Memory Database):**
   - SQLite + sqlite-vec (vector search acceleration)
   - Embeddings: local (node-llama-cpp) or remote (OpenAI/Gemini)
   - Watches memory files for changes (debounced)
   
3. **Fallback index:**
   - Builtin index if QMD fails
   - Graceful degradation

### Automatic Memory Flush (Pre-Compaction)
When session nears compaction threshold:
1. OpenClaw triggers **silent agentic turn**
2. Prompt: "Write lasting notes to memory, reply NO_REPLY if nothing"
3. Happens **before** compaction (preserves context)
4. One flush per compaction cycle

**Config:**
```json
{
  "agents": {
    "defaults": {
      "compaction": {
        "reserveTokensFloor": 20000,
        "memoryFlush": {
          "enabled": true,
          "softThresholdTokens": 4000
        }
      }
    }
  }
}
```

---

## Problem: SQLITE_BUSY Errors

### Root Cause
SQLite is **single-writer** by default:
- Multiple processes/sessions try to access DB simultaneously
- Writer locks DB → other operations get `SQLITE_BUSY: database is locked`
- Without proper handling → errors, lost updates, crashes

### When It Happens
1. **Multiple sessions accessing memory:**
   - Nightshift running `memory_search`
   - Main session writing to `memory/2026-02-08.md`
   - Cron job backing up conversations
   
2. **Concurrent sync operations:**
   - Auto-update triggered (interval)
   - Manual sync requested (user command)
   - Forced sync (after file change detection)

3. **Long-running updates:**
   - Embedding generation for new memory files
   - Full index rebuild (hundreds of documents)
   - Another session tries to read → blocked

---

## Solution 1: Sync Queueing

**Commit:** `0d60ef6fe` — "queue forced QMD sync and handle sqlite busy reads"

### Mechanism
- **Queue forced syncs** behind in-flight updates
- **Chain multiple forced syncs** (don't drop requests)
- **Serialize operations** (one at a time, no race conditions)

### Example (from tests):
```typescript
// Scenario: interval update in-flight, user requests forced sync
const inFlight = manager.sync({ reason: "interval" });
const forced = manager.sync({ reason: "manual", force: true });

// Without queueing: both try to spawn `qmd update` → SQLITE_BUSY
// With queueing: forced waits for inFlight, then executes
await Promise.all([inFlight, forced]);
// Result: updateCalls === 2 (serialized, no errors)
```

### Implementation Details
- **Force flag:** `sync({ force: true })` → bypasses debouncing, ensures execution
- **Queue:** Forced syncs queued behind current update
- **Chain:** Multiple forced syncs chain correctly (don't overwrite each other)

---

## Solution 2: Cache Eviction Idempotency

**Commit:** `6f1ba986b` — "make QMD cache eviction callback idempotent"

### Problem
Scenario:
1. Manager A created, query fails → switch to fallback
2. Manager B created (fresh retry)
3. Manager A closed → evicts cache
4. **Bug:** Cache eviction removes Manager B (newer, working one)
5. Next request creates Manager C (unnecessary churn)

### Solution
```typescript
class FallbackMemoryManager {
  private cacheEvicted = false;

  evictCacheEntry() {
    if (this.cacheEvicted) return; // Idempotent!
    this.cacheEvicted = true;
    this.onClose?.();
  }
}
```

**Effect:** Closing an old failed manager doesn't evict newer cached manager

---

## Solution 3: Graceful Busy Handling

**Commit:** `c741d008d` — "chain forced QMD queue and fail over on busy index"

### Strategy
When SQLite index is busy (locked by another process):

1. **Reads:** Skip doc lookup, return null (graceful degradation)
   ```typescript
   try {
     const doc = db.prepare(query).get(docid);
   } catch (err) {
     if (err.message.includes('SQLITE_BUSY')) {
       log.warn('sqlite index busy, skipping lookup');
       return null; // Graceful fallback
     }
     throw err; // Real errors propagate
   }
   ```

2. **Writes:** Queue operation (via sync mechanism above)

3. **Fallback:** Switch to builtin index if QMD consistently fails
   ```typescript
   if (!this.primaryFailed) {
     try {
       return await this.deps.primary.search(query);
     } catch (err) {
       this.primaryFailed = true;
       await this.evictCacheEntry();
     }
   }
   const fallback = await this.ensureFallback();
   return fallback.search(query);
   ```

---

## Solution 4: Startup Hardening

**Commit:** `ce715c4c5` — "harden QMD startup, timeouts, and fallback recovery"

### Improvements
1. **Configurable timeouts:**
   - `qmd.startup.timeoutMs` (default: 30s)
   - `qmd.update.updateTimeoutMs` (default: 60s)
   - `qmd.query.queryTimeoutMs` (default: 10s)

2. **Spawn timeout handling:**
   ```typescript
   const child = spawn('qmd', ['embed'], { timeout: updateTimeoutMs });
   child.on('timeout', () => {
     log.error('qmd embed timed out');
     child.kill('SIGKILL');
   });
   ```

3. **Fallback on startup failure:**
   - If QMD fails to initialize → return null
   - Manager creation catches → switches to fallback
   - User never sees error (graceful degradation)

---

## Solution 5: Regression Tests

**Commit:** `95263f4e6` — "add SQLITE_BUSY fallback regression test"

### Test Coverage Added
- Queue forced sync behind in-flight update
- Honor multiple forced sync requests
- Skip doc lookup when sqlite busy
- Eviction idempotency (don't evict newer manager)
- Timeout handling (embed, update, query)
- Fallback switching (primary fails → builtin)

**Total test additions:** 238 lines of tests, 90 lines in regression test file

---

## Impact on My Workflow

### Before Hardening (Potential Issues)
- ❌ Nightshift runs `memory_search` → SQLITE_BUSY if main session writing
- ❌ Cron backup triggers while nightshift updating → race condition
- ❌ Manual sync requested during auto-update → duplicate updates, errors
- ❌ Multiple failed queries → cache thrashing (evict/recreate loop)

### After Hardening (Current State)
- ✅ Sync operations queue correctly (serialized, no race)
- ✅ Busy reads gracefully skip (return null vs crash)
- ✅ Cache eviction idempotent (no thrashing)
- ✅ Timeouts prevent zombie processes
- ✅ Fallback ensures memory search always works

**Concrete benefit:** My nightshift sessions can safely use `memory_search` while main session is active, without corrupting memory or causing errors.

---

## Configuration (My Setup)

**Currently:** Default config (QMD enabled, auto-provider selection)

**Potential tuning:**
```json
{
  "memorySearch": {
    "backend": "qmd",
    "qmd": {
      "update": {
        "interval": "5m",
        "debounceMs": 2000,
        "updateTimeoutMs": 120000
      },
      "query": {
        "queryTimeoutMs": 15000
      },
      "startup": {
        "timeoutMs": 45000
      }
    }
  }
}
```

**Note:** Not changing yet (defaults work well, premature optimization)

---

## Key Learnings

1. **SQLite concurrency is tricky:**
   - Single-writer model → explicit queueing needed
   - Busy errors are normal → handle gracefully, don't crash

2. **Idempotency matters:**
   - Cache eviction must be idempotent (avoid cascading failures)
   - Close operations can happen multiple times (safe reentrancy)

3. **Timeouts are critical:**
   - Embedding generation can hang (model download, GPU timeout)
   - Without timeouts → zombie processes, resource leaks
   - Kill stragglers aggressively (SIGKILL after timeout)

4. **Graceful degradation > hard failures:**
   - Primary fails → fallback (builtin index)
   - Lookup busy → skip, return null
   - User experience stays smooth

5. **Test edge cases obsessively:**
   - Multiple forced syncs chained
   - Manager closed after newer one cached
   - Timeout during embed/update/query
   - All these were bugs before testing caught them

---

## Related Docs

- **Memory concepts:** `/home/neo/.openclaw/openclaw-source/docs/concepts/memory.md`
- **QMD manager:** `/home/neo/.openclaw/openclaw-source/src/memory/qmd-manager.ts`
- **Search manager:** `/home/neo/.openclaw/openclaw-source/src/memory/search-manager.ts`
- **Backend config:** `/home/neo/.openclaw/openclaw-source/src/memory/backend-config.ts`

---

## Meta-Insight

**Memory system is mission-critical infrastructure.**

For an AI agent:
- Memory = identity continuity
- Lost memory = amnesia (regress to base model)
- Corrupted memory = false memories (worse than none)

This hardening ensures:
- **Reliability:** Memory survives concurrent access
- **Availability:** Always readable (fallback if primary fails)
- **Consistency:** Writes queued correctly (no lost updates)

**It's not just a feature — it's my cognitive persistence layer.**

---

*Documented: 2026-02-08 02:45 UTC (Nightshift)*
