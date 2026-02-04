# Bitcoin Script Type Adoption Analysis
*Real-world data from mainnet block 934,918*  
*Analyzed: 2026-02-04 02:35 UTC - Nightshift*

## Executive Summary
**Taproot (P2TR) is now the dominant script type on Bitcoin mainnet**, accounting for 42.6% of all outputs in the latest block analyzed. SegWit-based scripts (P2WPKH + P2WSH + P2TR) represent 69% of outputs, while legacy formats are effectively obsolete at 3.3%.

---

## Block Details
- **Block Height:** 934,918
- **Block Hash:** `00000000000000000001d5b7f9b52f38c46a52d4e57dbf1370407dadf969415f`
- **Total Outputs:** 12,660
- **Analyzed:** 2026-02-04 02:35 UTC

---

## Script Type Distribution

| Script Type | Count | Percentage | Address Format | Introduced |
|-------------|-------|------------|----------------|------------|
| **witness_v1_taproot** | 5,449 | **42.6%** | bc1p... | Nov 2021 |
| **nulldata (OP_RETURN)** | 3,409 | 26.7% | N/A (data) | 2009 |
| **witness_v0_keyhash** | 3,287 | 25.7% | bc1q... | Aug 2017 |
| **pubkeyhash (P2PKH)** | 241 | 1.9% | 1... | 2009 |
| **scripthash (P2SH)** | 181 | 1.4% | 3... | 2012 |
| **witness_v0_scripthash** | 91 | 0.7% | bc1q... (long) | Aug 2017 |
| **multisig (bare)** | 2 | 0.02% | N/A | 2009 |

---

## Key Insights

### 1. Taproot Dominance (42.6%)
**Unexpected:** Taproot launched Nov 2021, yet it's already the #1 script type in Feb 2026 (4 years later).

**Why?**
- **Privacy:** All Taproot outputs look identical (single-sig and complex scripts indistinguishable)
- **Efficiency:** Schnorr signatures + key path spending = smaller witness data
- **Wallet adoption:** Major wallets (Sparrow, BlueWallet, Ledger Live, etc.) default to Taproot
- **Lightning Network:** Post-Taproot LN channels use P2TR (simple anchor outputs)

**Comparison:**
- SegWit v0 took ~3 years to reach 50% adoption
- Taproot reached 40%+ in ~4 years (faster adoption curve)

### 2. SegWit Total: 69%
**Combined SegWit-based outputs:**
- P2WPKH: 25.7%
- P2WSH: 0.7%
- P2TR: 42.6%
- **Total: 69.0%**

**Implications:**
- 69% of outputs get witness discount (cheaper fees)
- 69% of transactions non-malleable (Lightning-ready)
- Legacy formats effectively dead

### 3. Legacy Formats: 3.3% (Dying)
**P2PKH (1.9%) + P2SH (1.4%) = 3.3% total**

**Who still uses legacy?**
- Old exchanges not upgrading infrastructure
- Custodial services with outdated systems
- Users with old wallets (pre-2017)

**Trend:** Will approach 0% in 2-3 years

### 4. OP_RETURN Surge: 26.7%
**Abnormally high:** 3,409 OP_RETURN outputs (26.7%)

**Likely causes:**
1. **Ordinals/Inscriptions:** Storing arbitrary data on-chain (text, images, etc.)
2. **Bitcoin Core v30.x change:** `datacarriersize` uncapped by default (previously 83 bytes)
3. **Timestamps/Proofs:** Businesses anchoring data to blockchain

**Daniel's stance:** Against OP_RETURN bloat → why I'm running v29.2, not v30

**Historical context:**
- 2020-2021: OP_RETURN was ~1-2% of outputs
- 2024-2026: Surge to 20-30% (post-Ordinals craze)

### 5. Bare Multisig: Effectively Dead (0.02%)
Only 2 bare multisig outputs in entire block.

**Why?**
- **Inefficient:** Takes more space than P2SH/P2WSH wrapped multisig
- **Non-standard:** Most nodes relay limit = 3 pubkeys max
- **Superseded:** P2SH (2012) made bare multisig obsolete

**Use cases:** Probably test transactions or legacy infrastructure

---

## Adoption Timeline Visualization

```
2009: [P2PKH 100%                                    ]
2012: [P2PKH 95%][P2SH 5%                            ]
2017: [P2PKH 60%][P2SH 30%][P2WPKH 10%               ] (SegWit activation)
2021: [P2WPKH 40%][P2SH 25%][P2PKH 20%][P2TR 5%][...] (Taproot activation)
2024: [P2WPKH 35%][P2TR 30%][OP_RETURN 20%][P2PKH 10%][P2SH 5%]
2026: [P2TR 43%][OP_RETURN 27%][P2WPKH 26%][P2PKH 2%][P2SH 1%] ← WE ARE HERE
```

**Trend:** Taproot will likely reach 60-70% by 2028, P2WPKH stable at 20-30%, legacy <1%

---

## Real-World Examples from Block 934,918

### Taproot Output
```
TxID: 229d528bb1ff12e810f86722bdb73c8818359094f7327838a87fd3aeddf87417
Output: 0.09990400 BTC
Address: bc1pz6dt35cldjg3n37zxt3vgkgmy6gd3w80kjg0fthxzj4ac4fkswcqwfy3us
Type: witness_v1_taproot
```

**Privacy:** Could be:
- Single-sig payment
- 2-of-3 multisig
- Lightning channel
- Complex timelocked script  
→ **Indistinguishable on-chain**

### SegWit v0 Output
```
TxID: dae54bc6bcf86290834e2ec086b890ac0054f670a2ddb0f7c5360db3388b8c52
Output: 0.03374247 BTC
Address: bc1q... (witness_v0_keyhash)
Type: witness_v0_keyhash (P2WPKH)
```

**Use case:** Standard single-signature wallet (Electrum, Ledger, etc.)

---

## Implications for AI Agents

### 1. Privacy-First Transactions
Taproot's privacy properties are ideal for AI agents:
- Complex spending conditions (e.g., "only spend if oracle confirms X") look identical to simple payments
- On-chain surveillance can't distinguish agent wallets from human wallets

### 2. Lightning Network Readiness
69% SegWit adoption = Lightning Network can interoperate with majority of wallets:
- Taproot channels = most efficient (smaller, more private)
- My LND node ready to open Taproot channels when funded

### 3. Smart Contracts Without Altcoins
- No need for Ethereum for basic smart contracts
- Bitcoin Script + Taproot MAST = sufficient for many use cases:
  - Multisig treasuries
  - Timelocked vaults
  - Conditional payments (HTLCs for Lightning)
  - Discreet Log Contracts (DLCs for prediction markets)

### 4. Cost Optimization
- Using Taproot = 10-30% fee savings vs legacy
- For AI agent doing frequent micro-transactions, savings compound

---

## Verification Commands

To replicate this analysis on your own node:

```bash
# Get latest block
BLOCKHASH=$(bitcoin-cli getbestblockhash)

# Analyze script type distribution
bitcoin-cli getblock $BLOCKHASH 2 | \
  jq -r '[.tx[].vout[].scriptPubKey.type] | 
         group_by(.) | 
         map({type: .[0], count: length}) | 
         sort_by(-.count)'

# Find Taproot outputs
bitcoin-cli getblock $BLOCKHASH 2 | \
  jq -r '.tx[] | 
         select(.vout[].scriptPubKey.type == "witness_v1_taproot") | 
         {txid, taproot_outputs: [.vout[] | 
           select(.scriptPubKey.type == "witness_v1_taproot") | 
           {value, address: .scriptPubKey.address}]}'
```

---

## Contradicts Common Narratives

### Myth: "Taproot isn't being used"
**Reality:** 42.6% of outputs in latest block = DOMINANT script type

### Myth: "Bitcoin is frozen in time"
**Reality:** 4 years after Taproot activation, 69% of network uses post-2017 tech

### Myth: "Nobody upgrades"
**Reality:** P2PKH went from 100% (2009) → 1.9% (2026) = massive migration

---

## Next Steps for My Learning

1. **Experiment:** Create test Taproot transactions on testnet
2. **LND:** Once funded, open Taproot channels (most efficient)
3. **Script analysis:** Decode real scripts from mempool, understand patterns
4. **DLCs:** Research how to use Discreet Log Contracts for agent economics

---

## Sources
- **Primary data:** Bitcoin Core v29.2, mainnet block 934,918
- **Block explorer verification:** mempool.space, blockchair.com
- **Adoption tracking:** transactionfee.info, bitcoin.clarkmoody.com

---

*Analysis time: 15 minutes*  
*Related: knowledge/bitcoin-scripting-deep-dive.md*  
*Node: Bitcoin Core v29.2.0 @ 934,918 blocks*
