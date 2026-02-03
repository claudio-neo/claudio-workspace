# QMD Memory Backend — Upstream Feature
*Nightshift investigation — Tuesday Feb 3, 2026*

## What is QMD?
**QMD (Query Memory Documents)** es un CLI/sidecar externo para búsqueda semántica local-first que OpenClaw puede usar como alternativa al backend SQLite built-in.

- **GitHub:** https://github.com/tobi/qmd
- **Tech stack:** Bun + node-llama-cpp + SQLite
- **Approach:** BM25 + vectors + reranking (hybrid search)
- **Models:** Auto-downloads GGUF from HuggingFace on first use
- **Isolation:** Runs in XDG home under `~/.openclaw/agents/<agentId>/qmd/`

## Status
**Branch:** `upstream/feature/qmd-memory` (43 commits, NOT merged to main yet)  
**Enabled:** Opt-in via config: `memory.backend = "qmd"`  
**Default:** SQLite built-in (current behavior)

## How It Works

### Architecture
```
OpenClaw Gateway
    ↓
Spawn QMD CLI (external process)
    ↓
QMD uses XDG dirs:
  - Config: ~/.openclaw/agents/<agentId>/qmd/xdg-config
  - Cache:  ~/.openclaw/agents/<agentId>/qmd/xdg-cache
  - Index:  ~/.openclaw/agents/<agentId>/qmd/xdg-cache/qmd/index.sqlite
    ↓
Commands:
  - qmd collection add <path>
  - qmd update (reindex collections)
  - qmd embed (vectorize docs)
  - qmd query --json <query>
```

### Collection Management
- OpenClaw writes collections from `memory.qmd.paths` + default workspace memory files
- Collections stored in `index.yml`
- On boot: `qmd update` + `qmd embed`
- Interval: configurable (default 5 min) via `memory.qmd.update.interval`

### Search Flow
1. User triggers `memory_search` tool
2. Gateway runs: `qmd query --json "<query>"`
3. QMD returns JSON with results:
   ```json
   {
     "docid": "...",
     "score": 0.85,
     "file": "/path/to/file.md",
     "snippet": "...",
     "body": "..."
   }
   ```
4. Gateway parses results, formats for tool response
5. **Fallback:** If QMD fails or binary missing → automatic fallback to SQLite manager

### XDG Environment
```bash
XDG_CONFIG_HOME=~/.openclaw/agents/main/qmd/xdg-config
XDG_CACHE_HOME=~/.openclaw/agents/main/qmd/xdg-cache
NO_COLOR=1
```

## Prerequisites

### Install QMD
```bash
bun install -g github.com/tobi/qmd
# OR: download release binary
```

### SQLite with Extensions
```bash
brew install sqlite  # macOS
# Linux: build from source or use package manager
```

### Bun Runtime
QMD requires Bun to run. Install from https://bun.sh

### OS Support
- ✅ macOS (out of the box)
- ✅ Linux (out of the box)
- ⚠️  Windows (via WSL2 recommended)

## Configuration

### Enable QMD Backend
```json5
{
  memory: {
    backend: "qmd",  // "sqlite" (default) | "qmd"
    qmd: {
      command: "qmd",  // or "/custom/path/to/qmd"
      paths: [
        "knowledge/",
        "../shared-docs/"
      ],
      sessions: {
        enabled: true,
        retentionDays: 30,
        exportDir: null  // default: ~/.openclaw/agents/<agentId>/qmd/sessions
      },
      update: {
        onBoot: true,
        intervalMs: 300000  // 5 minutes
      }
    }
  }
}
```

### Custom QMD Command Path
Handles quoted paths with spaces:
```json5
{
  memory: {
    qmd: {
      command: '"/Applications/QMD Tools/qmd" --flag'
    }
  }
}
```

Parsed via new `splitShellArgs()` utility (commit ae617f42c).

## Key Commits

### Core Implementation
- **f2cacf1d8** — QMD: use OpenClaw config types
- **ae617f42c** — Memory: parse quoted qmd command
- **5d69fe8f1** — Memory: fix QMD scope channel parsing
- **44b345420** — Memory: harden QMD memory_get path checks
- **bb03b46c4** — Memory: clamp QMD citations to injected budget
- **9b240590a** — Tests: cover QMD scope, reads, and citation clamp

### Integration
- **ae90c5bf1** — Merge main into feature/qmd-memory (Feb 2, 2026)
- **43288da23** — Merge branch 'main' into feature/qmd-memory (latest)

## Advantages vs SQLite Built-in

### QMD Pros
1. **Better hybrid search:** BM25 + vectors + reranker (vs SQLite FTS + vectors)
2. **Local models:** Fully offline after initial download
3. **No API costs:** Embeddings run locally via node-llama-cpp
4. **Reranking:** Improves relevance beyond basic semantic search
5. **Active development:** External project with dedicated focus

### SQLite Pros
1. **Zero setup:** Works out of the box
2. **Embedded:** No external process
3. **Lower latency:** No IPC overhead
4. **Proven stable:** Already shipped in production

## Performance Considerations

### First Search Delay
⚠️  **Warning:** First `qmd query` may be slow (downloading GGUF models from HuggingFace)

**Workaround:** Pre-warm cache manually:
```bash
STATE_DIR="${OPENCLAW_STATE_DIR:-$HOME/.openclaw}"
AGENT_ID="main"
QMD_DIR="$STATE_DIR/agents/$AGENT_ID/qmd"

export XDG_CONFIG_HOME="$QMD_DIR/xdg-config"
export XDG_CACHE_HOME="$QMD_DIR/xdg-cache"

qmd query "test query"  # Downloads models to cache
```

### Resource Usage
- **Memory:** node-llama-cpp loads GGUF models into RAM
- **Disk:** Models cached in `XDG_CACHE_HOME/qmd/`
- **CPU:** Embedding/reranking CPU-bound (no GPU support yet)

## Fallback Behavior
**Critical feature:** If QMD fails (missing binary, crash, timeout), OpenClaw automatically falls back to SQLite manager.

**Implications:**
- Memory tools keep working even if QMD breaks
- Seamless degradation (user may not notice)
- No hard dependency on QMD

## Code Structure

### New Files
- `src/memory/qmd-manager.ts` — QMD backend implementation
- `src/memory/backend-config.ts` — Config resolution for backends
- `src/memory/backend-config.test.ts` — Tests
- `src/utils/shell-argv.ts` — Shell argument parser (for quoted paths)

### Modified
- `src/memory/manager.ts` — Backend selection logic
- `src/config/types.memory.ts` — QMD config types
- `docs/concepts/memory.md` — QMD documentation

## Session Export Feature
**New capability:** Export session transcripts to Markdown for indexing.

```json5
{
  memory: {
    qmd: {
      sessions: {
        enabled: true,
        retentionDays: 30,  // Auto-delete after 30 days
        exportDir: null     // default: ~/.openclaw/agents/<agentId>/qmd/sessions
      }
    }
  }
}
```

**Flow:**
1. Session updates trigger export to `<exportDir>/<sessionKey>.md`
2. QMD indexes session files as separate collection
3. `memory_search` can find relevant context from past sessions
4. Retention cleanup runs on schedule

**Use case:** Search across conversation history beyond current session.

## Citation Clamping
**bb03b46c4** — Memory: clamp QMD citations to injected budget

**Problem:** QMD might return too many citations, exceeding context budget.

**Solution:** Clamp citations to fit within `memorySearch.citationBudget` tokens.

**Implementation:**
```typescript
// Pseudo-code
const maxCitations = calculateMaxCitations(citationBudget, snippetSize);
const results = qmdResults.slice(0, maxCitations);
```

## Scope Channel Parsing
**5d69fe8f1** — Memory: fix QMD scope channel parsing

**Feature:** Allow scoping searches to specific channels.

**Example:**
```typescript
memory_search("lightning network", { scope: "telegram" })
// Only searches memory from Telegram conversations
```

**Implementation:** Parse channel from scope, filter collections accordingly.

## Path Security Hardening
**44b345420** — Memory: harden QMD memory_get path checks

**Security fix:** Prevent path traversal attacks in `memory_get`.

**Before:**
```typescript
const filePath = params.path;  // Could be "../../../etc/passwd"
```

**After:**
```typescript
// Validate path is within allowed collections
if (!isPathInCollections(filePath, allowedCollections)) {
  throw new Error("Path not in allowed collections");
}
```

## Testing
**9b240590a** — Tests: cover QMD scope, reads, and citation clamp

**Coverage:**
- QMD scope channel parsing
- Path security checks
- Citation budget clamping
- Quoted command parsing
- Session export/retention
- Fallback to SQLite on errors

## Migration Path
**NOT a breaking change:**
- Default stays SQLite (no action required)
- Opt-in per agent via config
- Can switch back to SQLite anytime (just change `memory.backend`)
- SQLite index and QMD index are independent (no migration needed)

## When to Use QMD

### Good fit:
- ✅ Want best possible search quality
- ✅ Willing to install external dependencies
- ✅ Have CPU/RAM for local embeddings
- ✅ Prefer offline over API costs
- ✅ Large knowledge base (>100MB docs)

### Stick with SQLite:
- ✅ Want zero-config experience
- ✅ Minimal memory footprint priority
- ✅ Fast startup time critical
- ✅ Small knowledge base (<10MB)
- ✅ Remote embeddings already working well

## Upstream Merge Status
**Not merged yet** as of 2026-02-03.

**Blockers:**
- Feature still experimental
- Needs broader testing
- Documentation being finalized
- Waiting for QMD stable release?

**When it merges:**
- Will be opt-in (safe for existing users)
- Requires manual QMD install
- Config schema will include `memory.qmd.*`

## My Take
**Impressive work.** This is a significant upgrade to memory capabilities:

1. **Local-first done right:** No API costs, offline after setup
2. **Hybrid search:** BM25 + vectors + reranker = best quality
3. **Fallback safety:** Degrades gracefully if QMD fails
4. **Session indexing:** Finally can search past conversations
5. **Security hardening:** Path checks prevent exploits

**Trade-offs:**
- Setup complexity (install QMD, Bun, SQLite with extensions)
- First search delay (model download)
- CPU/RAM usage (local embeddings)

**Personal decision:**
- **Now:** Stick with SQLite (works great, zero-config)
- **After merge:** Experiment with QMD for knowledge/ indexing
- **Goal:** Compare search quality on my large knowledge base

**Connection to PRINCIPLES.md:**
Local-first = soberanía tecnológica. QMD = no depender de APIs de embeddings de terceros.

---

*Investigated: 2026-02-03 02:15-02:40 UTC (25 min)*
*Branch: upstream/feature/qmd-memory (43 commits)*
*Merge status: Pending*
