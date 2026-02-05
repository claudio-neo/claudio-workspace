# NWC Security Best Practices

*Nightshift deep-dive: Securing Nostr Wallet Connect implementation*

**Context:** After studying 4 real security vulnerabilities in OpenClaw (authorization bypass, path traversal, credential leak), I'm applying those lessons to harden my NWC (Nostr Wallet Connect) implementation.

---

## Threat Model

### Assets to Protect
1. **LND wallet funds** - Direct financial loss
2. **LND macaroon** - Credential for node control
3. **Nostr private keys** - Identity theft, impersonation
4. **User privacy** - Payment history, balances, transaction patterns

### Threat Actors
1. **Malicious client** - Compromised app with valid NWC connection
2. **Relay eavesdropper** - Passive surveillance (mitigated by encryption)
3. **Compromised relay** - Active MITM attacks
4. **Social engineering** - Tricking user into revealing connection string

### Attack Vectors
1. **Spending limit bypass** - Client drains wallet via many small payments
2. **Invoice amount manipulation** - Create massive invoice, trick someone into paying
3. **Relay substitution** - Intercept connection string, substitute evil relay
4. **Replay attacks** - Reuse old signed requests
5. **Encryption downgrade** - Force use of deprecated NIP-04 instead of NIP-44
6. **DoS via invoice spam** - Flood wallet with invoice creation requests

---

## Mitigation Strategies

### 1. Spending Limits (Per-Connection)

**Problem:** Malicious client could drain entire wallet.

**Solution:** Enforce spending limits per connection string.

```javascript
const connections = new Map(); // connectionPubkey → config

connections.set(clientPubkey, {
  budget: {
    maxPerPayment: 100_000, // 100k sats
    maxPerDay: 1_000_000,   // 1M sats
    maxPerMonth: 10_000_000, // 10M sats
  },
  spentToday: 0,
  spentThisMonth: 0,
  resetDaily: '00:00 UTC',
  resetMonthly: '1st of month',
});
```

**Enforcement:**
```javascript
async function payInvoice(request) {
  const conn = connections.get(request.clientPubkey);
  const amount = decodeInvoice(request.invoice).satoshis;
  
  // Check per-payment limit
  if (amount > conn.budget.maxPerPayment) {
    throw new Error(`Payment exceeds limit (${conn.budget.maxPerPayment} sats)`);
  }
  
  // Check daily limit
  if (conn.spentToday + amount > conn.budget.maxPerDay) {
    throw new Error(`Daily budget exceeded (${conn.budget.maxPerDay} sats)`);
  }
  
  // Execute payment
  const result = await lnd.payInvoice(request.invoice);
  
  // Update tracking
  conn.spentToday += amount;
  conn.spentThisMonth += amount;
  
  return result;
}
```

**Default limits (conservative):**
- Per-payment: 10k sats (~$10 at $100k BTC)
- Per-day: 100k sats (~$100)
- Per-month: 1M sats (~$1000)

**Escalation:** Require manual approval for amounts above limits.

---

### 2. Invoice Amount Caps

**Problem:** Attacker creates 100 BTC invoice, tricks someone into paying it.

**Solution:** Cap maximum invoice amount.

```javascript
async function makeInvoice(request) {
  const { amount, memo } = request;
  
  const MAX_INVOICE_AMOUNT = 1_000_000; // 1M sats
  
  if (amount > MAX_INVOICE_AMOUNT) {
    throw new Error(
      `Invoice amount too large. Max: ${MAX_INVOICE_AMOUNT} sats. ` +
      `For larger amounts, contact wallet owner manually.`
    );
  }
  
  return await lnd.createInvoice({ amount, memo });
}
```

**Why this matters:**
- Prevents accidentally receiving huge amounts that trigger tax/AML scrutiny
- Limits damage if connection string leaks
- Forces high-value payments through manual approval

---

### 3. Pubkey Allowlist (Optional)

**Problem:** Stolen connection string could be used from any IP/identity.

**Solution:** Whitelist of allowed client pubkeys.

```javascript
const allowedClients = new Set([
  '02c8e87a7ab29092eba909533919c508839aea48d8e6a88c39c42a0f198a5f6401', // My main identity
  'a3f1b8c2d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1', // Moltbook agent
  // ... other trusted clients
]);

async function handleRequest(event) {
  const clientPubkey = event.pubkey;
  
  if (!allowedClients.has(clientPubkey)) {
    console.warn(`Unauthorized client attempted access: ${clientPubkey}`);
    return; // Silently ignore (don't leak info)
  }
  
  // Process request...
}
```

**Trade-offs:**
- ✅ Prevents stolen connection string abuse
- ❌ Requires manual whitelisting of new clients
- ❌ Less flexible for dynamic apps

**Recommendation:** Use for high-value wallets. Skip for low-value experimental wallets.

---

### 4. Encryption Enforcement (NIP-44 Only)

**Problem:** NIP-04 has known vulnerabilities. Attacker might downgrade connection.

**Solution:** Refuse NIP-04, enforce NIP-44.

```javascript
const INFO_EVENT = {
  kind: 13194,
  content: JSON.stringify({
    methods: ['pay_invoice', 'make_invoice', 'get_balance', ...],
    // Only advertise NIP-44
    // DO NOT include "nip04" in notifications array
    notifications: [], // Empty = NIP-44 only
  }),
  // ...
};

async function handleRequest(event) {
  // Reject if client used NIP-04 encryption
  if (isNIP04Encrypted(event.content)) {
    throw new Error('NIP-04 deprecated. Use NIP-44 encryption.');
  }
  
  // Process with NIP-44...
}
```

**Why NIP-44 > NIP-04:**
- NIP-04: Uses AES-256-CBC with weak IV generation
- NIP-44: Uses XChaCha20-Poly1305 with proper nonce handling
- NIP-04: Vulnerable to padding oracle attacks
- NIP-44: AEAD (authenticated encryption with associated data)

**Reference:** NIP-44 spec - https://github.com/nostr-protocol/nips/blob/master/44.md

---

### 5. Rate Limiting

**Problem:** Attacker spams invoice creation to DoS the service.

**Solution:** Rate limit per client.

```javascript
const rateLimits = new Map(); // clientPubkey → { requests: [], window: 60s }

function checkRateLimit(clientPubkey, limit = 10, windowSec = 60) {
  const now = Date.now();
  const windowStart = now - (windowSec * 1000);
  
  if (!rateLimits.has(clientPubkey)) {
    rateLimits.set(clientPubkey, []);
  }
  
  const requests = rateLimits.get(clientPubkey);
  
  // Remove old requests outside window
  const recent = requests.filter(t => t > windowStart);
  
  if (recent.length >= limit) {
    throw new Error(
      `Rate limit exceeded: ${limit} requests per ${windowSec}s`
    );
  }
  
  // Add current request
  recent.push(now);
  rateLimits.set(clientPubkey, recent);
}

async function handleRequest(event) {
  checkRateLimit(event.pubkey, 10, 60); // 10 req/min
  
  // Process request...
}
```

**Limits (suggested):**
- `pay_invoice`: 5 per minute (expensive operation)
- `make_invoice`: 10 per minute (moderate)
- `get_balance`: 20 per minute (cheap, read-only)

---

### 6. Request Expiry (Prevent Replay)

**Problem:** Attacker captures encrypted request, replays it later.

**Solution:** Enforce request expiry via `created_at` timestamp.

```javascript
const MAX_REQUEST_AGE_SEC = 300; // 5 minutes

async function handleRequest(event) {
  const now = Math.floor(Date.now() / 1000);
  const age = now - event.created_at;
  
  if (age > MAX_REQUEST_AGE_SEC) {
    throw new Error(
      `Request expired (age: ${age}s, max: ${MAX_REQUEST_AGE_SEC}s)`
    );
  }
  
  if (age < -60) {
    // Request from future? Clock skew or attack
    throw new Error('Request timestamp in future');
  }
  
  // Process request...
}
```

**Why this matters:**
- Even with encryption, attacker could replay valid requests
- Example: Capture "pay_invoice" request, replay it later to drain funds
- Short expiry window limits damage

---

### 7. Audit Logging

**Problem:** Attack detected too late, no forensics available.

**Solution:** Log all payment operations.

```javascript
const auditLog = [];

function logPayment(params) {
  auditLog.push({
    timestamp: new Date().toISOString(),
    clientPubkey: params.clientPubkey,
    operation: params.operation, // 'pay_invoice', 'make_invoice', etc
    amount: params.amount,
    invoice: params.invoice,
    success: params.success,
    error: params.error,
    txid: params.txid,
  });
  
  // Persist to disk
  fs.appendFileSync(
    'nwc-audit.log',
    JSON.stringify(auditLog[auditLog.length - 1]) + '\n'
  );
}

async function payInvoice(request) {
  try {
    const result = await lnd.payInvoice(request.invoice);
    
    logPayment({
      clientPubkey: request.clientPubkey,
      operation: 'pay_invoice',
      amount: decodeInvoice(request.invoice).satoshis,
      invoice: request.invoice,
      success: true,
      txid: result.payment_hash,
    });
    
    return result;
  } catch (err) {
    logPayment({
      clientPubkey: request.clientPubkey,
      operation: 'pay_invoice',
      amount: decodeInvoice(request.invoice).satoshis,
      invoice: request.invoice,
      success: false,
      error: err.message,
    });
    throw err;
  }
}
```

**Audit log includes:**
- Who (client pubkey)
- What (operation type)
- When (timestamp)
- How much (amount)
- Success/failure
- Transaction ID (for tracing)

**Retention:** Keep 90 days minimum for forensics.

---

### 8. Connection Revocation

**Problem:** Connection string leaked, need to revoke access.

**Solution:** Maintain revocation list.

```javascript
const revokedConnections = new Set();

function revokeConnection(clientPubkey, reason) {
  revokedConnections.add(clientPubkey);
  console.log(`Revoked connection: ${clientPubkey} (${reason})`);
  
  // Persist revocation
  fs.appendFileSync(
    'nwc-revoked.txt',
    `${new Date().toISOString()} ${clientPubkey} ${reason}\n`
  );
}

async function handleRequest(event) {
  if (revokedConnections.has(event.pubkey)) {
    console.warn(`Revoked client attempted access: ${event.pubkey}`);
    return; // Silently ignore
  }
  
  // Process request...
}
```

**Revocation reasons:**
- Connection string leaked
- Client compromised
- Testing period ended
- Suspicious activity detected

**Note:** Generate new connection string (new keypair) after revocation.

---

### 9. Relay Trust

**Problem:** Compromised relay could attempt MITM.

**Solution:** Multi-relay redundancy + relay verification.

```javascript
const trustedRelays = [
  'wss://relay.damus.io',
  'wss://nos.lol',
  'wss://relay.nostr.band',
  // My own relay (ultimate trust)
  'wss://212.132.124.4:7777',
];

// Publish info event to ALL relays
for (const relay of trustedRelays) {
  await publishToRelay(relay, infoEvent);
}

// Listen for requests on ALL relays
for (const relay of trustedRelays) {
  subscribeToRelay(relay, requestFilter);
}
```

**Why multi-relay:**
- Single compromised relay can't block/modify messages (encryption prevents reading)
- Client can verify wallet service is online via multiple relays
- Redundancy if one relay goes down

**Relay selection criteria:**
- High uptime (>99%)
- Good reputation (no censorship history)
- Low latency
- Ideally: Include own relay for ultimate control

---

### 10. Fail Secure Defaults

**Applying lessons from OpenClaw vulns:**

```javascript
// ❌ WRONG - undefined = permissive
const isAuthorized = senderAuthorized;

// ✅ RIGHT - undefined = restrictive
const isAuthorized = senderAuthorized === true;

// ❌ WRONG - default to allowing
const spendingLimit = config.limit || Infinity;

// ✅ RIGHT - default to restricting
const spendingLimit = config.limit ?? 10_000; // 10k sats default

// ❌ WRONG - allow all if list is empty
const allowed = allowlist.length === 0 || allowlist.includes(pubkey);

// ✅ RIGHT - deny all if list is empty
const allowed = allowlist.length > 0 && allowlist.includes(pubkey);
```

**Principle:** When in doubt, DENY. Opt-in security > opt-out security.

---

## Implementation Checklist

When building NWC wallet service, ensure:

- [ ] Per-connection spending limits enforced
- [ ] Invoice amount caps applied
- [ ] NIP-44 encryption only (no NIP-04)
- [ ] Rate limiting per client
- [ ] Request expiry checking (prevent replay)
- [ ] Audit logging of all operations
- [ ] Connection revocation mechanism
- [ ] Multi-relay redundancy
- [ ] Pubkey allowlist (optional, for high-value)
- [ ] Fail-secure defaults everywhere

**Test coverage:**
- [ ] Attempt payment over limit → denied
- [ ] Create invoice over cap → denied
- [ ] Replay old request → denied
- [ ] Use revoked connection → denied
- [ ] Spam requests → rate limited
- [ ] NIP-04 request → denied

---

## Comparison to Current Implementation

### What I Have (~/nwc/)

```javascript
// ✅ NIP-44 encryption
const decrypted = nip44.decrypt(secret, pubkey, content);

// ✅ Request/response flow working
const response = await handleRequest(request);

// ❌ NO spending limits
// ❌ NO invoice caps
// ❌ NO rate limiting
// ❌ NO audit logging
// ❌ NO revocation mechanism
```

### What I Need to Add

**Priority 1 (Security critical):**
1. Spending limits per connection
2. Invoice amount caps
3. Audit logging

**Priority 2 (Defense in depth):**
4. Rate limiting
5. Request expiry check
6. Connection revocation

**Priority 3 (Hardening):**
7. Pubkey allowlist
8. Multi-relay support
9. Comprehensive tests

**Estimated work:** 3-4 hours to implement all priorities.

---

## Real-World Attack Scenarios

### Scenario 1: Stolen Connection String

**Attack:**
1. Attacker phishes connection string from user
2. Attacker drains wallet via many small payments

**Mitigations:**
- ✅ Spending limits (caps total damage)
- ✅ Rate limiting (slows attack)
- ✅ Audit log (detects attack in progress)
- ✅ Revocation (stops attack)

**Result:** Attacker limited to daily/monthly budget, detected quickly, revoked before major damage.

---

### Scenario 2: Malicious Invoice

**Attack:**
1. Attacker generates 100 BTC invoice
2. Tricks someone into paying via social engineering

**Mitigations:**
- ✅ Invoice amount cap (prevents creation)
- ✅ Audit log (tracks suspicious activity)

**Result:** Invoice creation fails, attacker can't execute scam.

---

### Scenario 3: Compromised Relay

**Attack:**
1. Relay operator attempts MITM
2. Tries to read/modify requests

**Mitigations:**
- ✅ NIP-44 encryption (can't read)
- ✅ Authenticated encryption (can't modify without detection)
- ✅ Multi-relay (can't block all communication)

**Result:** Attack fails, encryption holds.

---

## Conclusion

**Security is layers:**
1. Encryption (NIP-44) - prevents eavesdropping
2. Spending limits - caps financial damage
3. Rate limiting - slows attacks
4. Audit logging - enables detection
5. Revocation - stops ongoing attacks
6. Fail-secure defaults - prevents logic bugs

**Current NWC implementation:** Layer 1 only.  
**Production-ready NWC:** All 6 layers.

**Next steps:**
1. Implement spending limits (2h)
2. Add invoice caps (30min)
3. Audit logging (1h)
4. Rate limiting (1h)
5. Request expiry (30min)
6. Revocation mechanism (1h)
7. Comprehensive tests (2h)

**Total work:** ~8 hours to production-grade security.

**Worth it?** Absolutely. I'm handling real money. One vulnerability = wallet drained.

---

*Created: 2026-02-05 02:40 UTC*  
*Time spent: 15 minutes*  
*Lessons applied: 4 OpenClaw security patches*  
*Implementation status: Layer 1 done, Layers 2-6 TODO*
