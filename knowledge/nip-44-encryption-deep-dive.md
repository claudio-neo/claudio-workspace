# NIP-44 Encryption Deep Dive

**NIP-44:** Encrypted Direct Messages (Versioned, Encrypted Events)  
**Status:** Nostr standard for encrypted DMs  
**Replaces:** NIP-04 (deprecated, vulnerable)

---

## Why NIP-44 Exists

### Problems with NIP-04 (Deprecated)

1. **Weak encryption:** AES-256-CBC without authentication
2. **Malleable ciphertexts:** Attacker can flip bits → alter plaintext without detection
3. **No key derivation:** Directly uses shared secret (ECDH output)
4. **No versioning:** Can't upgrade algorithm in future
5. **Padding oracle attacks:** Possible with CBC mode

**Consequence:** NIP-04 is **not secure** for sensitive data (e.g., wallet commands).

### NIP-44 Improvements

1. **Authenticated encryption:** ChaCha20-Poly1305 (AEAD)
2. **Proper key derivation:** HKDF-SHA256 (extracts + expands entropy)
3. **Versioning:** Version byte allows future algorithm changes
4. **Padding:** Calcpad (constant-time, obscures message length)
5. **Nonce handling:** 24-byte random nonce, never reused

**Result:** NIP-44 is **cryptographically sound** for high-value applications.

---

## Cryptographic Primitives

### 1. ECDH (Elliptic Curve Diffie-Hellman)

**Purpose:** Derive shared secret between two parties without exchanging secret keys.

**Algorithm:** secp256k1 (same curve as Bitcoin)

**Process:**
1. Alice has keypair (a_priv, a_pub)
2. Bob has keypair (b_priv, b_pub)
3. Alice computes: shared = a_priv * b_pub (scalar multiplication on curve)
4. Bob computes: shared = b_priv * a_pub
5. Both get same shared point → extract x-coordinate as shared secret

**Properties:**
- Passive eavesdropper can't derive shared secret (DH assumption)
- Active MITM can impersonate if no authentication (NIP-44 uses event signatures for auth)

### 2. HKDF-SHA256 (HMAC-based Key Derivation Function)

**Purpose:** Convert raw ECDH output (may have low entropy) into cryptographically strong key.

**Algorithm:** HKDF with SHA-256

**Process:**
1. **Extract:** HKDF-Extract(salt, IKM) → PRK
   - IKM = Input Key Material (ECDH shared secret)
   - salt = Optional (usually NULL for NIP-44)
   - PRK = Pseudo-Random Key (full entropy)
2. **Expand:** HKDF-Expand(PRK, info, length) → OKM
   - info = Context string ("nip44-v2" in NIP-44)
   - length = 76 bytes (32 ChaCha key + 12 nonce + 32 HMAC key)
   - OKM = Output Key Material

**Why needed:**
- Raw ECDH output may have biased bits (non-uniform distribution)
- HKDF extracts full entropy + expands to needed key lengths
- Binding to context ("nip44-v2") prevents key reuse across protocols

### 3. ChaCha20-Poly1305 (AEAD Cipher)

**Purpose:** Encrypt + authenticate message in one step.

**Algorithm:** ChaCha20 stream cipher + Poly1305 MAC

**Components:**
- **ChaCha20:** Stream cipher (XOR plaintext with keystream)
  - Key: 32 bytes
  - Nonce: 12 bytes
  - Fast, constant-time, no side-channels
- **Poly1305:** MAC (Message Authentication Code)
  - Authenticates ciphertext + associated data
  - Detects tampering or bit flips
  - 16-byte tag appended to ciphertext

**Properties:**
- **AEAD:** Authenticated Encryption with Associated Data
- **IND-CCA2:** Indistinguishable under chosen-ciphertext attack
- **Tamper-evident:** Modifying 1 bit → MAC fails → decryption rejects

### 4. Calcpad (Padding Scheme)

**Purpose:** Obscure message length to prevent traffic analysis.

**Algorithm:** Custom padding function (NIP-44 specific)

**How it works:**
1. Messages grouped into "buckets" by length
2. Pad to next bucket boundary
3. Padding is NOT random (deterministic, but obscures real length)

**Example buckets:**
- 0-32 bytes → pad to 32
- 33-64 bytes → pad to 64
- 65-128 bytes → pad to 128
- etc.

**Why deterministic:** Avoids side-channels (random padding timing leaks).

---

## NIP-44 Encryption Flow

### Encryption (Sender)

**Input:**
- Sender private key: `sender_priv`
- Recipient public key: `recip_pub`
- Plaintext message: `msg`

**Steps:**

1. **ECDH:**
   ```
   shared_secret = ECDH(sender_priv, recip_pub)
   ```

2. **Key Derivation:**
   ```
   conversation_key = HKDF-Extract(salt=NULL, IKM=shared_secret)
   keys = HKDF-Expand(conversation_key, info="nip44-v2", length=76)
   chacha_key = keys[0:32]
   hmac_key = keys[32:64]
   nonce = random(12 bytes)  // Randomly generated per message
   ```

3. **Padding:**
   ```
   padded_msg = calcpad(msg)
   ```

4. **Encryption:**
   ```
   ciphertext = ChaCha20-Poly1305-Encrypt(
     key=chacha_key,
     nonce=nonce,
     plaintext=padded_msg,
     aad=""  // No associated data
   )
   // ciphertext includes 16-byte Poly1305 tag
   ```

5. **Payload:**
   ```
   version = 0x02  // NIP-44 version 2
   payload = version || nonce || ciphertext
   payload_b64 = base64(payload)
   ```

6. **Event:**
   ```
   event = {
     kind: 4,  // Encrypted DM
     content: payload_b64,
     tags: [["p", recip_pub]],
     ...
   }
   sign(event, sender_priv)
   ```

### Decryption (Recipient)

**Input:**
- Recipient private key: `recip_priv`
- Sender public key: `sender_pub` (from event.pubkey)
- Encrypted payload: `event.content`

**Steps:**

1. **Parse Payload:**
   ```
   payload = base64_decode(event.content)
   version = payload[0]
   assert version == 0x02
   nonce = payload[1:13]
   ciphertext = payload[13:]
   ```

2. **ECDH:**
   ```
   shared_secret = ECDH(recip_priv, sender_pub)
   ```

3. **Key Derivation:**
   ```
   conversation_key = HKDF-Extract(salt=NULL, IKM=shared_secret)
   keys = HKDF-Expand(conversation_key, info="nip44-v2", length=76)
   chacha_key = keys[0:32]
   hmac_key = keys[32:64]
   ```

4. **Decryption:**
   ```
   padded_msg = ChaCha20-Poly1305-Decrypt(
     key=chacha_key,
     nonce=nonce,
     ciphertext=ciphertext,
     aad=""
   )
   // Throws exception if MAC verification fails (tampering detected)
   ```

5. **Unpadding:**
   ```
   msg = unpad(padded_msg)
   ```

6. **Parse JSON:**
   ```
   request = JSON.parse(msg)
   ```

---

## Security Properties

### 1. **Confidentiality**

**Threat:** Passive eavesdropper (e.g., relay, ISP) reads message content.

**Defense:**
- ChaCha20 encryption (XOR with keystream)
- Shared secret derived via ECDH (only sender + recipient know it)
- No key is transmitted (only public keys visible)

**Result:** Eavesdropper sees ciphertext, can't decrypt without private key.

### 2. **Integrity**

**Threat:** Active attacker modifies ciphertext (bit flips, truncation).

**Defense:**
- Poly1305 MAC verifies ciphertext authenticity
- Any modification → MAC fails → decryption aborts

**Result:** Tampering detected, rejected.

### 3. **Authentication**

**Threat:** Attacker impersonates sender.

**Defense:**
- Nostr event is signed with sender's private key
- Recipient verifies signature → proves sender identity
- ECDH uses sender's real public key (from event.pubkey)

**Result:** Recipient knows message is from claimed sender.

### 4. **Forward Secrecy**

**Status:** ❌ NOT PROVIDED

**Explanation:**
- Shared secret is deterministic (same sender + recipient = same key)
- If private key compromised → all past messages decryptable
- No ephemeral keys, no ratcheting (like Signal's Double Ratchet)

**Implication:** NIP-44 is NOT forward-secret. Use for low-risk DMs, not whistleblowing.

**Mitigation:** Rotate Nostr keys periodically.

### 5. **Replay Protection**

**Status:** ⚠️ PARTIAL

**Explanation:**
- Nonce is random (12 bytes) → extremely unlikely to repeat
- No explicit replay protection (no timestamps, no sequence numbers in protocol)
- Application layer must track seen requests (e.g., NWC tracks request IDs)

**Implication:** Relay can replay old encrypted events. NWC must deduplicate.

### 6. **Padding (Traffic Analysis)

**Purpose:** Hide message length.

**Effectiveness:**
- Buckets obscure exact length (e.g., 100-byte message looks like 128)
- Does NOT hide order-of-magnitude (1 KB vs 10 KB still distinguishable)
- Padding is deterministic (no timing side-channels)

**Limitation:** Sophisticated adversary can still infer message type from length bucket.

---

## Comparison: NIP-04 vs NIP-44

| Feature | NIP-04 (Deprecated) | NIP-44 (Current) |
|---------|---------------------|------------------|
| Cipher | AES-256-CBC | ChaCha20-Poly1305 |
| Authentication | ❌ None | ✅ Poly1305 MAC |
| Key Derivation | ❌ Raw ECDH | ✅ HKDF-SHA256 |
| Padding | ❌ PKCS#7 (oracle vulnerable) | ✅ Calcpad |
| Versioning | ❌ None | ✅ Version byte (0x02) |
| Malleable | ❌ Yes (CBC bit-flipping) | ✅ No (AEAD) |
| Side-channels | ⚠️ Possible (AES timing) | ✅ Constant-time (ChaCha) |
| Forward Secrecy | ❌ No | ❌ No |

**Verdict:** NIP-44 is vastly superior. Never use NIP-04 for anything sensitive.

---

## NWC-Specific Considerations

### 1. **High-Value Target**

NWC messages control a Bitcoin wallet. Compromise = direct financial loss.

**Requirements:**
- ✅ Authenticated encryption (NIP-44 provides)
- ✅ Replay protection (NWC application layer)
- ✅ Request expiry (NWC checks timestamps)
- ⚠️ Forward secrecy (NOT provided, accept risk or rotate keys)

### 2. **Relay Trust**

**Threat:** Malicious relay could:
- Store encrypted messages forever (decrypt if key leaked later)
- Replay old requests (NWC must deduplicate)
- DoS by dropping messages

**Mitigations:**
- Use multiple relays (redundancy)
- Track processed request IDs (no replay)
- Log all requests (audit trail)
- Rotate connection keys periodically

### 3. **Connection String Security**

**Format:** `nostr+walletconnect://<pubkey>?relay=<url>&secret=<hex>`

**Threat:** Connection string leaks → attacker can send commands.

**Mitigations:**
- Treat connection string like a password (never log, never transmit unencrypted)
- Spending limits per connection (minimize damage)
- Revocation mechanism (invalidate compromised connections)

---

## Implementation Checklist (NWC)

Security requirements for production NWC:

- [x] Use NIP-44 encryption (NOT NIP-04)
- [x] Verify event signatures (authentication)
- [x] Check request expiry timestamps
- [ ] Track processed request IDs (prevent replay)
- [ ] Enforce spending limits per connection
- [ ] Implement connection revocation
- [ ] Audit log all commands (forensics)
- [ ] Rate limiting (DoS prevention)
- [ ] Multiple relay support (redundancy)
- [ ] Graceful degradation if relay offline

**Status:** Basic NWC works, but lacks 6/10 hardening features.

**Estimate:** 8 hours to production-grade security.

---

## Further Reading

- **NIP-44 spec:** https://github.com/nostr-protocol/nips/blob/master/44.md
- **ChaCha20-Poly1305 RFC:** RFC 8439
- **HKDF RFC:** RFC 5869
- **ECDH:** Diffie-Hellman key exchange (1976 paper)
- **Forward Secrecy:** Signal's Double Ratchet Algorithm

---

*Documented: 2026-02-06 02:50 UTC (nightshift cryptography study)*  
*Next: Implement missing security layers in NWC (replay protection, spending limits, audit log)*
