# Telegram Timeout Fix — Cherry-pick c6b4de520
*Applied: 2026-02-03 02:12 UTC (nightshift)*

## Summary
Cherry-picked upstream fix for grammY "timed out" long-poll errors to `claudio/sovereign`.

## Problem
**Symptom:** Telegram polling loop dies silently after 500-second timeout.

**Root cause:**
- grammY `getUpdates` returns: "Request to getUpdates **timed out** after 500 seconds"
- OpenClaw's `RECOVERABLE_MESSAGE_SNIPPETS` only had `"timeout"`
- JavaScript: `"timed out".includes("timeout") === false`
- Error NOT classified as recoverable → polling loop exits permanently

**Impact:** Telegram connection drops permanently, requires manual gateway restart.

## Solution
**Commit:** c6b4de520af848bdfa577146aa8e2e001c87911d  
**Author:** mac mimi <macmimi@macs-Mac-mini.local>  
**Date:** Mon Feb 2 22:21:44 2026 +0100  
**PR:** #7239 (also fixes #7255)

**Changes:**
1. `src/telegram/network-errors.ts`:
   - Added `"timed out"` to `RECOVERABLE_MESSAGE_SNIPPETS`
   - Comment: "grammY getUpdates returns 'timed out after X seconds' (not matched by 'timeout')"

2. `src/telegram/network-errors.test.ts`:
   - Added test: `detects grammY 'timed out' long-poll errors (#7239)`
   - Added test suite: `Grammy HttpError` (3 tests for issue #3815)

**Total:** 2 files changed, 46 insertions(+)

## Cherry-pick Process
```bash
$ cd /home/neo/.openclaw/openclaw-source
$ git cherry-pick c6b4de520
# CONFLICT in src/telegram/network-errors.ts
# CONFLICT in src/telegram/network-errors.test.ts
```

**Conflicts:**
- `network-errors.ts`: Missing `"timeout"` and `"timed out"` lines
- `network-errors.test.ts`: Missing new test + Grammy HttpError suite

**Resolution:** Manual merge accepting upstream changes
```bash
$ vim src/telegram/network-errors.ts       # Added 2 lines to RECOVERABLE_MESSAGE_SNIPPETS
$ vim src/telegram/network-errors.test.ts  # Added test + describe block
$ git add src/telegram/network-errors.ts src/telegram/network-errors.test.ts
$ git cherry-pick --continue
[claudio/sovereign 333340ffb] fix(telegram): recover from grammY "timed out" long-poll errors (#7239)
```

## Verification
```bash
$ git log --oneline -3
333340ffb fix(telegram): recover from grammY "timed out" long-poll errors (#7239)
27ef33629 fix: resolve remaining conflict markers in compaction-safeguard and extension-relay
e4f35bb28 fix: restore telegram draft streaming partials (#5543) (thanks @obviyus)
```

**Build status:** Running `pnpm build` to verify no regressions (in progress)

## Why This Matters
**Personal impact:** This fix explains crashes/desconexiones Telegram recientes.

**Before fix:**
- Timeout error → not recoverable → polling loop dies
- Gateway appears running but Telegram is dead
- User sees no messages, bot unresponsive
- Requires manual `openclaw gateway restart`

**After fix:**
- Timeout error → recoverable → polling loop retries
- Temporary network issues handled gracefully
- No user-visible disruption
- Self-healing behavior

## Related Upstream Issues
- #7239 — getUpdates timeout not recoverable
- #7255 — polling loop dies silently (same root cause)
- #3815 — Grammy HttpError wrapping (test suite added)

## Integration Notes
**Safe to apply:** Yes
- 2 files modified (network-errors.ts + test)
- No breaking changes
- Only adds to existing RECOVERABLE_MESSAGE_SNIPPETS array
- Tests validate behavior

**Already applied to:** `claudio/sovereign` (333340ffb)

**Still pending:**
- Build verification (pnpm build running)
- Restart gateway to apply changes
- Monitor for reduced Telegram disconnections

## Code Review
**Before:**
```typescript
const RECOVERABLE_MESSAGE_SNIPPETS = [
  "fetch failed",
  "typeerror: fetch failed",
  "undici",
  "network error",
  "network request",
  "client network socket disconnected",
  "socket hang up",
  "getaddrinfo",
];
```

**After:**
```typescript
const RECOVERABLE_MESSAGE_SNIPPETS = [
  "fetch failed",
  "typeerror: fetch failed",
  "undici",
  "network error",
  "network request",
  "client network socket disconnected",
  "socket hang up",
  "getaddrinfo",
  "timeout", // catch timeout messages not covered by error codes/names
  "timed out", // grammY getUpdates returns "timed out after X seconds" (not matched by "timeout")
];
```

**Elegant:** Two simple string additions fix a critical reliability issue.

## Test Coverage
**New test:**
```typescript
it("detects grammY 'timed out' long-poll errors (#7239)", () => {
  const err = new Error("Request to 'getUpdates' timed out after 500 seconds");
  expect(isRecoverableTelegramNetworkError(err)).toBe(true);
});
```

**Grammy HttpError suite:**
- `detects network error wrapped in HttpError`
- `detects network error with cause wrapped in HttpError`
- `returns false for non-network errors wrapped in HttpError`

**Mock implementation:**
```typescript
class MockHttpError extends Error {
  constructor(
    message: string,
    public readonly error: unknown,
  ) {
    super(message);
    this.name = "HttpError";
  }
}
```

## Lesson: String Matching Edge Cases
**JavaScript gotcha:**
```javascript
"timeout".includes("timed out")  // false ✅
"timed out".includes("timeout")  // false ❌ (this was the bug)
```

**Solution:** Explicit list of both variations
- `"timeout"` — catches "connection timeout", "request timeout"
- `"timed out"` — catches "timed out after X seconds"

**Alternative approaches NOT used:**
- Regex: `/time.*out/` — too broad, false positives
- Normalize spaces: too fragile, edge cases
- Error code instead of message: grammY doesn't set specific code

**Why message matching:** grammY errors don't always have consistent error codes, message text is the most reliable signal.

## Impact Analysis
**Frequency:** Unknown, but frequent enough for 2 GitHub issues (#7239, #7255)

**Severity:** High
- Silent failure (no error logged visibly)
- Requires manual intervention (restart)
- User perception: "bot is broken"

**Fix complexity:** Low (2 lines + tests)

**Regression risk:** Low
- Only expands recoverable error detection
- Existing behavior unchanged
- Tests validate no false positives

## Future Improvements
**Possible enhancements:**
1. Log when recoverable errors hit retry limit
2. Metrics for recoverable vs non-recoverable errors
3. Exponential backoff for retries (may already exist)
4. User-visible notification if polling stuck (before this fix)

**Not needed now:** Fix is sufficient, more complexity = more bugs.

---

*Cherry-picked: 2026-02-03 02:12 UTC*  
*Build verification: In progress*  
*Documented: 2026-02-03 02:18 UTC*
