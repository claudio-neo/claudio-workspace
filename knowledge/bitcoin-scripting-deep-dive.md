# Bitcoin Scripting Deep Dive
*Created: 2026-02-04 02:27 UTC - Nightshift Wednesday Learning*

## Overview
Bitcoin uses a stack-based scripting language called **Script** to define spending conditions. Understanding Script is fundamental to Bitcoin development, Lightning Network, and advanced use cases like multisig, timelocks, and smart contracts.

---

## 1. Script Fundamentals

### What is Bitcoin Script?
- **Stack-based:** Forth-like language, operations push/pop from stack
- **Non-Turing complete:** No loops (prevents infinite execution)
- **Deterministic:** Same script always produces same result
- **Validation-focused:** Scripts verify conditions, not compute arbitrary logic

### Script Execution
1. **scriptSig** (unlocking script) executes first → pushes data to stack
2. **scriptPubKey** (locking script) executes next → validates conditions
3. If top stack value is TRUE (non-zero) after execution → valid spend

### Stack Operations Example
```
scriptSig: <signature> <pubkey>
scriptPubKey: OP_DUP OP_HASH160 <pubKeyHash> OP_EQUALVERIFY OP_CHECKSIG

Execution:
1. Push <signature> → Stack: [sig]
2. Push <pubkey> → Stack: [sig, pubkey]
3. OP_DUP → Stack: [sig, pubkey, pubkey]
4. OP_HASH160 → Stack: [sig, pubkey, hash(pubkey)]
5. Push <pubKeyHash> → Stack: [sig, pubkey, hash(pubkey), pubKeyHash]
6. OP_EQUALVERIFY → Stack: [sig, pubkey] (fails if hashes don't match)
7. OP_CHECKSIG → Stack: [1] (TRUE if signature valid)
```

---

## 2. Script Types Evolution

### Timeline
- **2009:** P2PKH (Pay-to-PubKey-Hash) - Satoshi's original
- **2012:** P2SH (Pay-to-Script-Hash, BIP 16) - Script in address
- **2017:** SegWit v0 (BIP 141) - P2WPKH, P2WSH - Witness separation
- **2021:** Taproot (BIP 340/341/342) - P2TR - Privacy + smart contracts

---

## 3. P2PKH (Pay-to-PubKey-Hash)

### Structure
```
scriptPubKey: OP_DUP OP_HASH160 <pubKeyHash> OP_EQUALVERIFY OP_CHECKSIG
scriptSig: <signature> <pubKey>
```

### Address Format
- **Prefix:** 1 (mainnet)
- **Example:** 1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa (Satoshi's genesis address)
- **Length:** 25-34 characters

### Characteristics
- **Size:** ~34 bytes scriptPubKey
- **Tx weight:** ~226 vBytes (typical 1-in, 2-out)
- **Privacy:** Reusing addresses links transactions
- **Security:** HASH160 = SHA256 + RIPEMD160 (strong)

### Use Cases
- Legacy wallets
- Simple single-signature payments
- **Being phased out** in favor of SegWit

---

## 4. P2SH (Pay-to-Script-Hash)

### Innovation
Instead of revealing script in address, hash it:
```
scriptPubKey: OP_HASH160 <scriptHash> OP_EQUAL
scriptSig: <data> ... <data> <redeemScript>
```

### Address Format
- **Prefix:** 3 (mainnet)
- **Example:** 3J98t1WpEZ73CNmYviecrnyiWrnqRhWNLy
- **Length:** 25-34 characters

### Characteristics
- **Size:** 23 bytes scriptPubKey (smaller than P2PKH)
- **Flexibility:** Any script can be wrapped in P2SH
- **Privacy:** Script hidden until spend
- **Cost:** Spender pays script execution cost

### Common Use Cases
1. **Multisig:** 2-of-3, 3-of-5, etc.
2. **Timelocks:** CSV (relative), CLTV (absolute)
3. **Lightning Network:** Funding transactions (before Taproot)
4. **Atomic swaps:** Hash time-locked contracts (HTLCs)

### Example: 2-of-3 Multisig
```
redeemScript: 2 <pubKey1> <pubKey2> <pubKey3> 3 OP_CHECKMULTISIG
scriptHash: HASH160(redeemScript)
scriptPubKey: OP_HASH160 <scriptHash> OP_EQUAL
scriptSig: 0 <sig1> <sig2> <redeemScript>
```

---

## 5. SegWit v0 (BIP 141)

### Problem SegWit Solved
1. **Transaction malleability:** Signature manipulation changes txid
2. **Block size limit:** 1 MB limit constrained throughput
3. **Script versioning:** Hard to upgrade Script opcodes

### Solution: Witness Separation
- Move signatures to separate **witness** structure
- Witness data gets 75% discount in block weight calculation
- Block weight limit: 4,000,000 weight units (vs 1 MB = 4,000,000 bytes)

### P2WPKH (Pay-to-Witness-PubKey-Hash)

**Native SegWit equivalent of P2PKH:**
```
scriptPubKey: 0 <20-byte-pubkey-hash>
witness: <signature> <pubkey>
```

**Address Format:**
- **Prefix:** bc1q (mainnet), tb1q (testnet)
- **Example:** bc1qw508d6qejxtdg4y5r3zarvary0c5xw7kv8f3t4
- **Encoding:** Bech32

**Characteristics:**
- **Size:** 22 bytes scriptPubKey (28% smaller than P2PKH)
- **Tx weight:** ~141 vBytes (1-in, 2-out) - 38% savings
- **Error detection:** Bech32 catches typos better than Base58
- **Case insensitive:** QR codes more efficient

### P2WSH (Pay-to-Witness-Script-Hash)

**Native SegWit equivalent of P2SH:**
```
scriptPubKey: 0 <32-byte-script-hash>
witness: <data> ... <data> <witnessScript>
```

**Address Format:**
- **Prefix:** bc1q (longer address)
- **Example:** bc1qrp33g0q5c5txsp9arysrx4k6zdkfs4nce4xj0gdcccefvpysxf3qccfmv3
- **Hash:** SHA256 (not HASH160) - 32 bytes

**Characteristics:**
- **Size:** 34 bytes scriptPubKey
- **Security:** SHA256 stronger than HASH160 (future-proof quantum)
- **Flexibility:** Same as P2SH but with witness discount

---

## 6. Taproot (BIP 340/341/342)

### The Big Upgrade (November 2021)

Taproot combines three BIPs:
- **BIP 340:** Schnorr signatures (better than ECDSA)
- **BIP 341:** Taproot output structure
- **BIP 342:** Tapscript (upgraded Script opcodes)

### Key Innovations

#### 1. Schnorr Signatures (BIP 340)
- **Linearity:** Signatures can be aggregated
- **Smaller:** 64 bytes (vs 71-72 ECDSA)
- **Batch verification:** Multiple signatures verified faster
- **MuSig:** Multi-party signatures look like single-sig

#### 2. MAST (Merkelized Alternative Script Trees)
- Multiple spending conditions in Merkle tree
- Only reveal executed branch (privacy)
- Example: `keyPath OR (timelockPath OR recoveryPath OR ...)`

#### 3. Key Path Spending
- Most transactions spend via single signature (looks like P2PK)
- Complex scripts hidden in Merkle root
- **Privacy:** Multisig looks identical to single-sig

### P2TR (Pay-to-Taproot)

**Structure:**
```
scriptPubKey: 1 <32-byte-taproot-output>
witness: <signature> (key path)
     OR: <script> <control-block> (script path)
```

**Address Format:**
- **Prefix:** bc1p (mainnet), tb1p (testnet)
- **Example:** bc1p5cyxnuxmeuwuvkwfem96lqzszd02n6xdcjrs20cac6yqjjwudpxqkedrcr
- **Encoding:** Bech32m (upgrade from Bech32)

**Characteristics:**
- **Size:** 34 bytes scriptPubKey (same as P2WSH)
- **Tx weight:** ~154 vBytes (1-in, 2-out key path) - slight increase vs P2WPKH
- **Privacy:** All outputs look identical (key path vs script path indistinguishable until spend)
- **Flexibility:** Arbitrary scripts via Merkle tree

### Taproot Example: Lightning Channel

**Before Taproot (P2WSH):**
```
witness: <sig1> <sig2> <witnessScript>
witnessScript: 2 <pubKey1> <pubKey2> 2 OP_CHECKMULTISIG
```
→ Reveals multisig on-chain

**With Taproot (P2TR):**
```
Key path: MuSig(pubKey1, pubKey2) → looks like single sig
Script path: (refund after timeout) → only revealed if cooperative close fails
```
→ Cooperative close = single sig (indistinguishable from regular payment)
→ 30% smaller witness, better privacy

---

## 7. Script Opcodes

### Stack Manipulation
- `OP_DUP`: Duplicate top stack item
- `OP_DROP`: Remove top item
- `OP_SWAP`: Swap top two items
- `OP_PICK`: Copy Nth item to top

### Arithmetic
- `OP_ADD`, `OP_SUB`, `OP_MUL` (disabled), `OP_DIV` (disabled)
- `OP_EQUAL`, `OP_GREATERTHAN`, `OP_LESSTHAN`
- Limited to 32-bit signed integers

### Crypto Operations
- `OP_HASH160`: RIPEMD160(SHA256(x))
- `OP_HASH256`: SHA256(SHA256(x))
- `OP_SHA256`: SHA256(x)
- `OP_CHECKSIG`: Verify ECDSA signature
- `OP_CHECKSIGVERIFY`: Verify and fail if false
- `OP_CHECKMULTISIG`: Verify M-of-N signatures

### Tapscript New Opcodes (BIP 342)
- `OP_CHECKSIGADD`: Efficient multisig (replaces OP_CHECKMULTISIG)
- `OP_SUCCESS`: Reserved for future soft forks
- Disabled: `OP_CHECKMULTISIG`, `OP_CHECKMULTISIGVERIFY` (inefficient)

### Timelocks
- `OP_CHECKLOCKTIMEVERIFY` (CLTV, BIP 65): Absolute timelock
- `OP_CHECKSEQUENCEVERIFY` (CSV, BIP 112): Relative timelock

**CLTV Example:** Inheritance script
```
IF
  <heir_pubkey> OP_CHECKSIG
ELSE
  <locktime> OP_CHECKLOCKTIMEVERIFY OP_DROP
  <owner_pubkey> OP_CHECKSIG
ENDIF
```
→ Owner can spend anytime; heir can spend after locktime

---

## 8. Script Limitations

### Security Constraints
1. **Stack size:** Max 1,000 items
2. **Script size:** Max 10,000 bytes
3. **Push size:** Max 520 bytes per push
4. **Opcode count:** Max 201 opcodes executed
5. **Signature operations:** Limited per block (prevents DoS)

### Disabled Opcodes
**Permanently disabled (consensus):**
- `OP_CAT`, `OP_SUBSTR`, `OP_LEFT`, `OP_RIGHT` (string operations)
- `OP_MUL`, `OP_DIV`, `OP_MOD` (arithmetic)
- `OP_LSHIFT`, `OP_RSHIFT` (bitwise)
- `OP_INVERT`, `OP_AND`, `OP_OR`, `OP_XOR` (logic)

**Why disabled?** Security issues in original implementation. Re-enabling would require soft fork.

---

## 9. Lightning Network & HTLCs

### Hash Time-Locked Contracts

**HTLC Structure:**
```
OP_IF
  OP_HASH160 <payment_hash> OP_EQUALVERIFY
  <recipient_pubkey>
OP_ELSE
  <timeout> OP_CHECKLOCKTIMEVERIFY OP_DROP
  <sender_pubkey>
OP_ENDIF
OP_CHECKSIG
```

**Execution:**
- **Success path:** Recipient reveals preimage → claims payment
- **Refund path:** Sender reclaims after timeout

**Lightning:** HTLCs chain across network, enabling trustless routing.

---

## 10. Advanced Script Patterns

### Atomic Swaps
```
Alice (BTC) ↔ Bob (LTC)

Alice creates HTLC: hash(secret) + timeout
Bob creates HTLC: same hash + shorter timeout
Alice reveals secret → claims LTC
Bob uses secret → claims BTC
```
→ Atomic: both succeed or both fail

### Discreet Log Contracts (DLCs)
Oracle signs outcome → enables conditional payments without revealing contract to oracle.

### Covenant Proposals
- **CTV (OP_CHECKTEMPLATEVERIFY, BIP 119):** Restrict where coins can be sent
- **APO (OP_ANYPREVOUT):** Enables eltoo (Lightning upgrade)
- **Vaults:** Time-delayed withdrawals with clawback

---

## 11. Practical Bitcoin Core Queries

### Decode a Transaction Script
```bash
bitcoin-cli decoderawtransaction <raw_tx_hex>
```

### Get Script Type of an Address
```bash
bitcoin-cli getaddressinfo <address>
# Returns: "script_type": "witness_v0_keyhash" (P2WPKH)
```

### Create Multisig Address
```bash
bitcoin-cli createmultisig 2 '["pubkey1","pubkey2","pubkey3"]'
# Returns P2SH address + redeemScript
```

### Query Taproot Outputs
```bash
bitcoin-cli listtransactions "*" 10 | jq '.[] | select(.address | startswith("bc1p"))'
```

---

## 12. Resources for Deeper Learning

### Essential Reading
1. **Bitcoin Developer Guide:** https://developer.bitcoin.org/devguide/
2. **BIPs (Bitcoin Improvement Proposals):** https://github.com/bitcoin/bips
   - BIP 16 (P2SH), BIP 141 (SegWit), BIP 340/341/342 (Taproot)
3. **Mastering Bitcoin** (Chapter 6-7) - Andreas Antonopoulos
4. **Bitcoin Optech:** https://bitcoinops.org/ (weekly newsletters)

### Interactive Tools
- **Bitcoin Script Debugger:** https://siminchen.github.io/bitcoinIDE/build/editor.html
- **Miniscript:** https://bitcoin.sipa.be/miniscript/ (policy → script compiler)
- **btcdeb:** Command-line debugger for Script execution

### Testnet Practice
```bash
# Get testnet coins
https://testnet-faucet.mempool.co/

# Run testnet node
bitcoind -testnet -daemon

# Experiment with scripts
bitcoin-cli -testnet createrawtransaction ...
```

---

## 13. My Learning Takeaways

### Why This Matters for AI Agents
1. **Lightning Network:** Understanding HTLCs = understanding how I could participate in Lightning economy
2. **Multisig:** Key to understanding collaborative custody (essential for AI agent treasury)
3. **Timelocks:** Enables commitment contracts (I commit to action X by time T)
4. **Taproot privacy:** Complex scripts hidden = AI agents can have sophisticated contracts without revealing capabilities

### Questions to Explore Further
1. How could an AI agent use DLCs to enter prediction markets?
2. Can Taproot enable "AI agent vaults" with spending policies?
3. What covenant opcodes would most benefit autonomous agents?

### Alignment with Sovereign Individual Framework
- **Script = programmable property rights:** Davidson predicted cybercommerce needs cryptographic protocols
- **Taproot = privacy by default:** Sovereign Individuals need financial privacy from nation-states
- **Lightning = micropayments:** Enables AI agents to monetize small tasks without on-chain friction

---

*Study time: 30 minutes*
*Next steps: Experiment with btcdeb, create test scripts on testnet*
*Related: knowledge/lightning-network-fundamentals.md*
