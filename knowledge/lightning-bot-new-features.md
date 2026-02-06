# Lightning Telegram Bot - New Features Implemented

## Summary
Successfully added 4 new commands inspired by lntxbot and SatsMobiBot to the Lightning Telegram Bot.

## Implementation Details

### 1. `/pay <invoice>` - Pay External Lightning Invoice
**Features:**
- Decodes BOLT11 invoice to show amount and description
- Asks for confirmation with inline button before paying
- Applies 1% withdrawal fee (FEE_WITHDRAWAL=100 basis points)
- Checks user balance before payment
- Uses LND REST API: `POST /v1/channels/transactions`
- Records transaction as 'withdrawal'
- Financial rate limiting applies
- Sends confirmation with payment hash
- Handles errors (insufficient balance, route not found, etc.)
- All responses sent via DM for privacy

**Usage:**
```
/pay lnbc100n1...
```

### 2. `/giveaway <amount>` - Quick Giveaway in Groups
**Features:**
- Creates a fast-claim giveaway in group chats
- Posts message with "🎁 Reclamar" inline button
- First user to press button gets the sats
- Uses atomic transaction pattern (tipTransferAtomic)
- Giver cannot claim their own giveaway
- Only works in groups (not private chat)
- Auto-expires after 5 minutes with refund to giver
- Min: 10 sats, Max: 100,000 sats

**Usage:**
```
/giveaway 1000
```

### 3. `/giveflip <amount> [participants]` - Random Giveaway
**Features:**
- Like giveaway but waits for N participants (default 2)
- Each participant clicks "Participar" button
- When full, randomly picks a winner using `Math.random()`
- Giver pays, winner gets all
- Giver cannot join their own giveflip
- Auto-expires after 10 minutes with refund to giver
- Shows progress with participant list
- Min: 10 sats, Max: 500,000 sats
- Participants: 2-20

**Usage:**
```
/giveflip 5000 5
```

### 4. `/fundraise <amount_per_person> <participants> <@recipient>` - Crowdfunding
**Features:**
- Creates crowdfunding where N people each contribute X sats
- All funds go to specified recipient (@username or telegram_id)
- Progress shown with inline button "Contribuir X sats"
- Creator auto-contributes first
- When all slots filled, transfers total to recipient
- Auto-expires after 30 minutes with refund to all contributors
- Shows real-time progress with contributor list
- Min per person: 10 sats, Max: 100,000 sats
- Participants: 2-50

**Usage:**
```
/fundraise 1000 10 @DeltaGap
/fundraise 500 5 140223355
```

## Database Schema Changes

Added 5 new tables:

```sql
-- Giveaways
CREATE TABLE giveaways (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  message_id INTEGER,
  chat_id INTEGER,
  giver_telegram_id INTEGER,
  amount_sats INTEGER,
  claimer_telegram_id INTEGER,
  status TEXT DEFAULT 'active',
  created_at INTEGER,
  expires_at INTEGER
);

-- Giveflips
CREATE TABLE giveflips (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  message_id INTEGER,
  chat_id INTEGER,
  giver_telegram_id INTEGER,
  amount_sats INTEGER,
  max_participants INTEGER DEFAULT 2,
  winner_telegram_id INTEGER,
  status TEXT DEFAULT 'active',
  created_at INTEGER,
  expires_at INTEGER
);

CREATE TABLE giveflip_participants (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  giveflip_id INTEGER,
  telegram_id INTEGER,
  FOREIGN KEY (giveflip_id) REFERENCES giveflips(id)
);

-- Fundraises
CREATE TABLE fundraises (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  message_id INTEGER,
  chat_id INTEGER,
  creator_telegram_id INTEGER,
  recipient_telegram_id INTEGER,
  recipient_username TEXT,
  amount_per_person INTEGER,
  max_participants INTEGER,
  status TEXT DEFAULT 'active',
  created_at INTEGER,
  expires_at INTEGER
);

CREATE TABLE fundraise_contributors (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  fundraise_id INTEGER,
  telegram_id INTEGER,
  FOREIGN KEY (fundraise_id) REFERENCES fundraises(id)
);
```

## Callback Query Handler Extensions

Added 4 new callback types to `bot.on('callback_query')`:

1. **`pay_confirm:<userId>:<amount>:<fee>`** - Confirms payment after showing details
2. **`giveaway_claim:<giveawayId>`** - Claims giveaway (first come, first served)
3. **`giveflip_join:<giveflipId>`** - Joins giveflip (random winner when full)
4. **`fundraise_contribute:<fundraiseId>`** - Contributes to fundraise

## Cleanup System

Extended `cleanupExpired()` function to handle:
- **Expired giveaways** (5 min): Refunds giver if unclaimed
- **Expired giveflips** (10 min): Refunds giver if incomplete
- **Expired fundraises** (30 min): Refunds all contributors if incomplete

## Updated Help System

- Added new commands to `/help` command
- Added new commands to `/start` welcome message
- All commands available with detailed help: `/help <command>`

## Testing

✅ Syntax check passed: `node -c bot.js`
✅ Service restarted successfully
✅ No startup errors in logs
✅ Bot is active and running

## Git Commit

```
commit 8123ec3
feat: add /pay, /giveaway, /giveflip, /fundraise commands
```

## Technical Notes

- All user-facing messages in Spanish
- All financial data sent to DM (never in groups)
- Used existing patterns:
  - `lndRequest()` for LND calls
  - `tipTransferAtomic()` for balance transfers
  - `getOrCreateUser()` for user management
  - `checkRateLimit()` for rate limiting
  - `logActivity()` for logging
  - `escMd()` for Markdown escaping
- Temporary payment data stored in `global.pendingPayments` Map
- Auto-expiry with cleanup and refunds
- Inline buttons for user interaction
- Real-time message updates with progress

## Service Status

```
● lightning-bot.service - Lightning Telegram Bot
     Loaded: loaded
     Active: active (running) since Thu 2026-02-05 18:21:46 UTC
   Main PID: 2360369 (node)
```

✅ All features implemented successfully!
