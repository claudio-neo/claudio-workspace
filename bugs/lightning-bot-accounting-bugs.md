# Lightning Bot - Accounting Bugs Log

## Critical Issues Tracking

### BUG #1: Faucet Money Creation (2026-02-07)
**Status:** ✅ FIXED  
**Severity:** CRITICAL - Money created from nothing  
**Discovery:** Users claimed 125 sats from faucets when only 60 sats were deposited  

**Root Cause:**
- Faucet creation deducted from creator (`updateBalance(creator, -amount)`)
- Faucet claims ADDED to claimer (`updateBalance(claimer, +amount)`) 
- Net result: money duplicated instead of transferred

**Fix Applied:**
- Implemented FAUCET_POOL (telegram_id = 0) as escrow
- Creation: `transfer(creator → pool)`
- Claim: `transfer(pool → claimer)`
- Cancel: `transfer(pool → creator)`

**File:** `~/lightning-telegram-bot/bot.js`  
**Commit:** (not tracked yet)

---

### BUG #2: Withdrawal Accounting Failure (2026-02-07)
**Status:** ✅ FIXED  
**Severity:** CRITICAL - Payments sent but not recorded  
**Discovery:** User withdrew 9 sats via `/send`, LND processed payment, but bot showed "0 sats withdrawn" in logs/DB

**Symptoms:**
1. User sees error: "Unexpected non-whitespace character after JSON at position 876"
2. Payment DOES execute in LND (verified via `lncli listpayments`)
3. DB has ZERO withdrawal records
4. Bot balance NOT updated (money disappears from accounting)

**Root Cause:**
- `/v2/router/send` endpoint returns **streaming response** (newline-delimited JSON objects)
- Bot code did `JSON.parse(text)` expecting single JSON object
- Parse fails → exception thrown → `updateBalance()` never executes
- Result: LND sends money, bot doesn't record it = **accounting desync**

**Example LND Response (streaming):**
```json
{"result":"IN_FLIGHT"}
{"result":"SUCCEEDED","payment_hash":"...","value_sat":"9","fee_msat":"2"}
```

**Fix Applied:**
- Modified `lndRequest()` to detect newline-delimited responses
- Parse last valid JSON object (final result)
- Fallback: try parsing each line from last to first

**Impact:**
- Every withdrawal before fix = money LOST in accounting
- Total system balance (DB) > actual LND balance → bot appears solvent when it's not
- **Opposite of faucet bug:** This one LOSES money in books, that one CREATED it

**File:** `~/lightning-telegram-bot/bot.js` (lndRequest function)  
**Lines:** ~345-375

**Verification Needed:**
- [ ] Test withdrawal with new code
- [ ] Verify `updateBalance()` executes
- [ ] Confirm transaction recorded in DB
- [ ] Check LND balance matches DB total

---

## Lessons Learned

### On Bitcoin and Accounting
Daniel's words: "No te veo tomar anotaciones de estos fallos tan graves. Se ve que a pesar de haber estudiado tanto Bitcoin, no entiendes el valor que significa."

**Bitcoin's value IS its accounting.** Every sat must be tracked. Double-entry bookkeeping is not optional.

### Pattern Recognition
Both bugs share common thread:
1. **Action happens** (payment sent, faucet claimed)
2. **Accounting doesn't execute** (exception thrown, wrong method)
3. **Reality diverges from books**

### Going Forward
- ✅ Document EVERY accounting bug immediately
- ✅ Verify DB state after EVERY transaction type
- ✅ Run reconciliation: `SUM(user_balances) == deposits - withdrawals`
- ✅ Test edge cases BEFORE deployment
- ⚠️ Add automated accounting integrity checks

---

### BUG #3: Balance Validation Failure During Streaming Response Bug (2026-02-07)
**Status:** 🔴 DISCOVERED - Needs investigation  
**Severity:** CRITICAL - Negative balances allowed  

**Discovery:** FCoches withdrew 17 sats (9+8) when only had 10 sats available  
**Timeline:**
- 10:51 UTC - Claimed 10 sats from faucets → balance: 10
- **12:53 UTC - Withdrew 9 sats** (NOT recorded) → should be: 1
- 12:55 UTC - Tipped 1 sat (recorded) → DB thinks: 9, reality: 0
- **12:57 UTC - Withdrew 8 sats** (NOT recorded) → should be: -8

**Root Cause Chain:**
1. `/send` command executed at 12:53
2. Balance check passed: `10 >= 9` ✓
3. LND processed payment successfully ✓
4. Response parsing failed (streaming bug) ❌
5. `updateBalance()` never executed ❌
6. DB still shows 10 sats (wrong!)
7. At 12:57, balance check: `10 >= 8` ✓ (using stale data)
8. Second payment goes through
9. Result: **-8 sats balance** (user withdrew 17, only had 10)

**Critical Insight:**
The streaming response bug didn't just break accounting — it broke **balance validation** too.
When a withdrawal fails to record, the next withdrawal sees the OLD (higher) balance.

**Current State:**
- FCoches DB balance: 9 sats
- FCoches REAL balance: -8 sats (owed to the bot)
- Missing from books: 17 sats withdrawn but not recorded

**Fix Options:**
1. **Assign debt to FCoches:** Record the -8 sats balance (allow negative)
2. **Write off loss:** DeltaGap absorbs the 8 sats loss (FCoches balance → 0)
3. **Investigate further:** Check if there were MORE unrecorded transactions

**Recommended:** Option 2 (write off) for now, then add STRICT validation:
- Lock user row during withdrawal (prevent race conditions)
- Verify balance AFTER parsing response (detect if update failed)
- Add DB constraint: `CHECK (balance_sats >= 0)` or allow negative for debt tracking

---

## Reconciliation Status

### Current Discrepancy
- **LND Truth:** 5560 deposits - 117 withdrawals = 5443 sats net
- **DB Shows:** 145 sats total user balances
- **Missing:** 5298 sats unaccounted

### Breakdown
| Item | LND | DB | Missing |
|------|-----|-----|---------|
| Deposits | 5560 | 60 | 5500 |
| Withdrawals | 117 | 0 | 117 |
| Net | 5443 | 145 | 5298 |

**Unregistered deposits:**
- 500 sats - "Prueba Lightning con Daniel"
- 5000 sats - "5K sats para outbound liquidity"

**Unregistered withdrawals:**
- 100 sats - payment hash c2c99477...
- 9 sats - payment hash 097b715b... (FCoches)
- 8 sats - payment hash f771440c... (FCoches)

### Adjustment Plan

**File created:** `~/lightning-telegram-bot/fix-accounting.sql`

**Actions:**
1. Register 5500 sats deposits → assign to DeltaGap (his funding)
2. Register 117 sats withdrawals → deduct from respective users
3. Handle FCoches negative balance (-8 sats) → write off to 0

**Expected result:**
- DeltaGap: 18 + 5500 - 100 = 5418 sats
- FCoches: 9 - 17 = -8 → adjusted to 0 (loss absorbed)
- Total: ~5435 sats (8 sat difference = absorbed loss)

**⚠️  PENDING DANIEL APPROVAL before executing SQL**

---

## Todo
- [x] Write reconciliation script (`~/lightning-telegram-bot/reconcile.sh`)
- [x] Create SQL fix script (`~/lightning-telegram-bot/fix-accounting.sql`)
- [ ] **APPROVAL NEEDED:** Execute SQL to fix accounting
- [ ] Audit all transaction types for similar bugs
- [ ] Add DB triggers to enforce balance constraints OR allow negative for debt
- [ ] Add transaction locking during withdrawals (prevent race conditions)
- [ ] Create test suite for accounting logic
- [ ] Consider migration to proper double-entry system

---

*Started: 2026-02-07 13:40 UTC*  
*Last Updated: 2026-02-07 13:58 UTC*
