# System Memory Analysis — 2026-02-03 18:13 UTC

**Triggered by:** High memory usage detected (12GB/15GB = 80%)

---

## Memory Overview

```
Total: 15GB
Used: 12GB (80%)
Free: 364MB
Available: 3.2GB (buffer/cache)
Swap: 0B (no swap configured)
```

**Status:** ⚠️ High but stable (no swap thrashing)

---

## Top Memory Consumers

| Process | %MEM | RSS | Owner | Description |
|---------|------|-----|-------|-------------|
| **bitcoind** | 27.5% | 4.5GB | neo | Bitcoin Core v29.2.0 (mainnet, pruned) |
| **next-server** | 16.9% | 2.7GB | neo | Next.js server (likely neofreight/calamardo) |
| **openclaw-gateway** | 9.6% | 1.5GB | neo | OpenClaw runtime (me) |
| **ollama** | 4.9% | 806MB | ollama | Local LLM server |
| **chromium** | 3.0% | 497MB | neo | Browser automation (headless) |
| **java (keycloak)** | 2.4% | 406MB | user 1000 | Keycloak authentication server |
| **python (uvicorn)** | 1.2% | 209MB | root | Python web server |
| **mariadb** | 0.8% | 144MB | mysql | Database server |

---

## Analysis

### Bitcoin Node (27.5% = 4.5GB)
**Status:** ✅ Expected
- Running full node sync/operation
- Pruned mode (550MB) but needs RAM for UTXO set, mempool, connections
- 10 peers connected, mempool 23MB
- This is normal operation

**Action:** None needed

### next-server (16.9% = 2.7GB)
**Status:** ⚠️ High but NOT mine
- Process owned by `neo` user but likely neofreight or calamardo
- PID 2073870, running since Jan 28
- Next.js v16.0.7 server

**Question:** ¿Es parte de neofreight/calamardo?
**Action:** No tocar (not my system per MEMORY.md)

### openclaw-gateway (9.6% = 1.5GB)
**Status:** ✅ Reasonable for my workload
- This is ME
- Running since 07:13 today (after restart)
- Handles:
  - Main session (this conversation)
  - Heartbeat cron
  - Skills (bitcoin-node-monitor, self-improving-agent, etc.)
  - Browser automation
  - Memory system + compactions

**Breakdown estimate:**
- Node.js runtime: ~300MB base
- Session context (131K tokens): ~200-300MB
- Skills loaded: ~100MB
- Browser automation: ~500MB (chromium processes)
- Buffers/cache: ~400MB

**Action:** Monitor, but normal for current workload

### ollama (4.9% = 806MB)
**Status:** ✅ Normal
- Local LLM server (llama3.2:1b, qwen2.5:7b, deepseek-r1:7b models)
- Idle but resident in memory
- Potentially useful for lightweight tasks without API calls

**Action:** None needed

---

## Potential Optimizations

### 1. Swap Configuration ⚠️
**Current:** No swap (0B)
**Risk:** If memory spikes > 15GB → OOM killer may terminate processes

**Recommendation:**
```bash
# Add 4GB swap file (emergency buffer)
sudo fallocate -l 4G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
```

**Why:** Safety net against OOM, not for regular use

### 2. OpenClaw Memory
**Current:** 1.5GB
**Optimizations possible:**
- Use Haiku for heartbeats (smaller context)
- Periodic context compaction (already happening)
- Unload unused skills (if any)

**Current status:** Within acceptable range

### 3. Browser Automation
**Current:** Multiple chromium processes (~500MB total)
**Note:** Likely needed for browser skill, canvas, etc.

**Action:** Monitor, may be able to close inactive sessions

---

## System Resources Summary

**Disk:** 98GB / 464GB (21%) ✅ Healthy
**Memory:** 12GB / 15GB (80%) ⚠️ High but stable
**Swap:** 0GB (none configured) ⚠️ Risk

**Services Running:**
- ✅ Bitcoin Core (synced 100%)
- ✅ OpenClaw Gateway
- ✅ ollama (local LLM)
- ⚠️ next-server (high memory, not mine)
- ✅ Keycloak, MariaDB, Python services

---

## Recommendations

### Immediate
1. **Monitor memory trends** - Track if usage increases or stays stable
2. **Document baseline** - This snapshot = baseline for comparison

### Short-term
3. **Consider swap** - 2-4GB swap file as safety net
4. **Identify next-server** - Confirm if it's neofreight/calamardo
5. **Test Haiku switching** - Measure memory savings in heartbeats

### Long-term
6. **Memory alerts** - Script to alert if memory >90%
7. **Process monitoring** - Track memory growth over time
8. **Optimize if needed** - Only if memory becomes problem

---

## Conclusions

**Memory usage is HIGH but not critical:**
- ✅ Bitcoin node needs what it needs (4.5GB normal)
- ✅ OpenClaw using reasonable amount (1.5GB)
- ⚠️ next-server is biggest unknown (2.7GB - not mine)
- ✅ No swap thrashing (because no swap)
- ⚠️ No safety buffer if spike occurs

**Status:** Monitor but don't panic. System stable.

**Action taken:** Documented baseline for future comparison

---

**Generated:** 2026-02-03 18:14 UTC  
**Next check:** Daily or if system feels slow
