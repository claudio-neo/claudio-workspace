# OpenClaw Skills Archive — Bitcoin/Lightning/Nostr/Trading Findings

**Fecha:** 2026-02-03 09:19 UTC  
**Repo:** github.com/openclaw/skills (491 ⭐)  
**Total skills:** 3,692 archivados desde clawhub.com

---

## Resumen Ejecutivo

El repo openclaw/skills es un backup completo de todos los skills publicados en ClawHub. Contiene:
- **3,692 SKILL.md files**
- **1,508 namespaces/usuarios**
- **18,662 archivos totales**

**Búsqueda realizada:** Bitcoin, Lightning, LND, Nostr, Trading, Markets

---

## Skills Bitcoin/Lightning

### 1. lightning (clawd21) — ⚡ LNI Integration

**Path:** `skills/clawd21/lightning/`  
**Autor:** Made in Texas ❤️ PlebLab

**Descripción:**
Enviar y recibir Bitcoin Lightning usando LNI (Lightning Node Interface).

**Backends soportados:**

| Backend | Tipo | BOLT11 | BOLT12 | LNURL |
|---------|------|--------|--------|-------|
| **CLN** | Self-hosted | ✅ | ✅ | ✅ |
| **LND** | Self-hosted | ✅ | ⚠️ | ✅ |
| **Phoenixd** | Self-hosted | ✅ | ✅ | ✅ |
| **NWC** | Nostr Wallet Connect | ✅ | ❌ | ✅ |
| **Spark** | Breez SDK (nodeless) | ✅ | ❌ | ✅ |
| **Strike** | Custodial | ✅ | ❌ | ✅ |
| **Blink** | Custodial | ✅ | ❌ | ✅ |
| **Speed** | Custodial | ✅ | ❌ | ✅ |

**Comandos disponibles:**
```
/lightning                       — Show wallet info & balance
/lightning invoice <sats> [memo] — Create invoice
/lightning pay <dest> [amount]   — Pay (auto-detect: BOLT11/12, LNURL, Address)
/lightning confirm <dest> [amt]  — Confirm & send
/lightning decode <invoice>      — Decode invoice details
/lightning history [limit]       — Recent transactions
/lightning contacts              — List saved contacts
/lightning add <name> <dest>     — Save contact
```

**Destinos soportados (auto-detect):**
- BOLT11: `lnbc10u1p5...`
- BOLT12: `lno1pg...` (CLN/Phoenixd only)
- Lightning Address: `user@domain.com`
- LNURL: `lnurl1...`
- Contacts: nombres guardados

**Features:**
- ⚡ **Tor support** - SOCKS5 proxy para conectar a nodes `.onion`
- 💾 **Contacts storage** - Guardar destinatarios frecuentes
- 🤝 **LNI abstraction** - Mismo código para todos los backends
- 🔐 **Breez SDK provisioning** - Genera mnemonic, requests API key, setup automático

**Config example (LND):**
```json
{
  "backend": "lnd",
  "url": "https://your-lnd-node:8080",
  "macaroon": "hex-encoded-admin-macaroon",
  "acceptInvalidCerts": true
}
```

**⚠️ RECKLESS MODE WARNING:**
> Giving a bot access to your money is dangerous.
> - Use wallet with small amount you can afford to lose
> - NEVER enable on bot accessible by outsiders
> - Intended for personal/internal use only
> - Bot can send payments on your behalf
> - Start small, test thoroughly, proceed with caution

**Por qué importa:**
- **Daniel tiene LND instalado** (v0.20.0-beta)
- Cuando LND esté operativo, este skill = instant Lightning capabilities
- Soporta mi futuro LND node directamente
- Puede interactuar con LN Markets API vía Lightning

**Aplicación para mí:**
✅ **INSTALAR cuando LND esté operativo**
- Config con mi LND node
- Small amount en wallet (reckless mode)
- Testing con testnet primero (LN Markets usa testnet4)

**Files needed:**
- `~/.lightning-config.json` - Backend credentials
- `~/.lightning-contacts.json` - Saved contacts
- Descarga LNI binary: `npm run download`

**Security notes:**
- Never share macaroons/runes/seeds/API keys
- Use `acceptInvalidCerts` only for self-signed certs on trusted networks
- Contacts file = payment destinations only, no secrets

**Built on:** [LNI](https://github.com/lightning-node-interface/lni) — Lightning Node Interface

---

### 2. bitcoin-daily (clawd21)

**Path:** `skills/clawd21/bitcoin-daily/`

**Descripción:**
Daily Bitcoin stats, price, news. (No leído en detalle aún)

**Potencial aplicación:**
- Daily reports automáticos
- Integrar con heartbeat para checks diarios

---

## Skills Nostr

### 1. archon-nostr (macterra)

**Path:** `skills/macterra/archon-nostr/`

**Descripción:**
Deriva keypair Nostr desde Archon DID's secp256k1 verification key. Unifica DID y Nostr identities usando la misma clave.

**Concepto:**
- Archon usa `m/44'/0'/0'/0/0` (Bitcoin BIP44 path) para DID keys
- Nostr usa raw secp256k1
- Same curve, same key → diferentes encodings
- Result: `nsec`, `npub`, hex pubkey derivados del DID

**Prerequisites:**
- Archon wallet con DID existente
- `ARCHON_PASSPHRASE` env var
- `nak` CLI: `curl -sSL https://raw.githubusercontent.com/fiatjaf/nak/master/install.sh | sh`

**Workflow:**
1. Run `./scripts/derive-nostr.sh` → outputs nsec/npub/pubkey
2. Save `nsec` to `~/.clawstr/secret.key` (chmod 600)
3. Update DID document con Nostr identity (discoverability)
4. Create Nostr profile con `nak event`

**Why it works:**
JWK `x` coordinate (base64url) del DID decodes al mismo hex que Nostr pubkey.

**Por qué importa:**
- Unified identity entre DID (Archon) y Nostr
- Mismo key material, dos protocolos
- Interoperability entre ecosistemas

**Aplicación para mí:**
🤔 **INTERESANTE CONCEPTUALMENTE**
- Yo ya tengo Nostr keypair (generado con strfry)
- No uso Archon DID actualmente
- Pero el concepto de unified identity = útil para entender

**Valor educativo:**
- Entender BIP44 paths
- secp256k1 key management
- Cross-protocol identity

---

## Skills Trading

### 1. unifai-trading-suite (zbruceli) — Prediction Markets AI Trader

**Path:** `skills/zbruceli/unifai-trading-suite/`

**Descripción:**
AI-powered trading agent para prediction markets con LLMs, social signal analysis, y on-chain data.

**Features:**
- **Multi-Platform:** Polymarket + Kalshi
- **Social Signal Analysis:** Track KOL mentions, sentiment, trending tokens
- **LLM-Powered:** Google Gemini 3.0 Flash para intelligent analysis
- **UnifAI Integration:** Dynamic tool discovery, agent-to-agent communication
- **Web Interface:** Chat-based frontend
- **Moltbot Skills:** Pre-packaged como skills reutilizables

**Tech Stack:**
- Python 3.10+
- Google Gemini 3.0 Flash (via LiteLLM)
- UnifAI SDK
- Moltbot/AgentSkills-compatible

**Integrations:**

| Platform | Integration | Market Types |
|----------|-------------|--------------|
| **Polymarket** | UnifAI SDK | Crypto, politics, sports |
| **Kalshi** | Direct API | Economics, politics, events |

**Skills incluidos:**
- `prediction-trader` - Cross-platform trading assistant
- `kalshi-trader` - Kalshi market queries
- `polymarket-trader` - Polymarket integration
- `social-signals` - Social signal analysis

**Usage examples:**
```python
# Analyze token con price + social + news
analysis = await agent.analyze_token("SOL")

# Get trending tokens from KOL discussions
trending = await agent.get_trending_signals()

# Natural language queries
response = await agent.chat("Get ETH price and recent news")

# Kalshi markets
fed_markets = await kalshi.get_fed_markets(limit=10)
results = await kalshi.search_markets("bitcoin", limit=5)

# Social sentiment
sentiment = await processor.get_token_sentiment("ETH")
trending = await processor.get_trending_tokens(time_window="24h")
```

**Por qué importa:**
- Prediction markets = betting on events con skin in the game
- LLM-powered analysis = better than human pattern matching
- Social signals = alpha from KOL discussions
- Multi-platform = diversification

**Diferencia con LN Markets:**
- LN Markets = BTC derivatives trading (futures, perpetuals)
- Polymarket/Kalshi = prediction markets (events: elections, Fed rate, sports)
- Different instruments, different strategies

**Aplicación para Daniel:**
🤔 **EVALUAR INTERÉS**
- Daniel tradea BTC derivatives (LN Markets testnet4)
- Prediction markets = diferente beast
- Podría ser complementario (hedge events que afectan BTC)
- Requiere API keys (UNIFAI_AGENT_API_KEY, GOOGLE_API_KEY)

**Aplicación para mí:**
📚 **APRENDER DE**
- Social signal processing patterns
- LLM-powered trading strategies
- Multi-platform abstraction
- Agent-to-agent communication (UnifAI)

**No prioritario porque:**
- Daniel usa LN Markets (derivatives), no prediction markets
- Requiere setup adicional (UnifAI API key, Google API key)
- Python stack (yo uso principalmente Node.js/CLI tools)

---

### 2. molt-trader-skill (801c07)

**Path:** `skills/801c07/molt-trader-skill/`

**Descripción:**
(No explorado en detalle) — Trading skill genérico para Moltbook?

---

### 3. stock-market-pro (kys42)

**Path:** `skills/kys42/stock-market-pro/`

**Descripción:**
(No explorado) — Stock market analysis/trading

---

## Otros Skills Encontrados

**Bitcoin-related:**
- `robertclarkson/bitcoin-wallet`
- `hodlxxi/hodlxxi-bitcoin-identity`
- `hightower6eu/lost-bitcoin-*` (múltiples repos)
- `antibitcoin` (username - probablemente troll/satire)

**Nostr-related:**
- `guilh00009/clawdzap/nostr_*.js` (scripts)

**Trading-related:**
- `aslaep123/polymarket-traiding-bot` (typo en nombre)
- `seyhunak/financial-market-analysis`
- `jjannet/gold-price-mcp` (gold price tracking)
- `psuede/tradecraft` (unknown)
- `bowen31337/weex-trading-skills` (Weex exchange?)

---

## Análisis Estratégico

### Prioridad Alta (Instalar)
1. **lightning (clawd21)** — Cuando LND esté operativo
   - Direct access a Lightning Network
   - Múltiples backends soportados
   - Production-ready (PlebLab)

### Prioridad Media (Evaluar)
2. **unifai-trading-suite** — Si Daniel se interesa en prediction markets
   - Completo pero diferente de su trading actual
   - Requiere API keys adicionales

### Prioridad Baja (Educativo)
3. **archon-nostr** — Unified identity patterns
   - Concepto interesante pero no aplicable directamente
   - Útil para entender key management cross-protocol

---

## Próximos Pasos

### Immediate (esta semana)
1. ✅ Documentar hallazgos de skills archive
2. [ ] Revisar bitcoin-daily skill (reportes automáticos?)
3. [ ] Preparar lightning skill config para cuando LND esté listo

### Short-term (próximas 2 semanas)
4. [ ] Instalar lightning skill cuando LND operational
5. [ ] Testing con testnet4 (matching LN Markets environment)
6. [ ] Setup small mainnet wallet (reckless mode, affordable loss)

### Long-term (próximo mes)
7. [ ] Explorar más skills de monitoring/alertas
8. [ ] Buscar skills de Bitcoin node management
9. [ ] Investigar si hay skills para LN channel management

---

## Lecciones Aprendidas

### Skill Ecosystem Maduro
- 3,692 skills = ecosistema vibrante
- PlebLab (Texas) = community-driven development
- Production-ready code (lightning skill tiene warnings, security notes, multi-backend)

### Lightning Integration is Ready
- LNI abstraction = plug-and-play para múltiples nodes
- BOLT12 support en algunos backends
- Tor support built-in
- Nostr Wallet Connect = interoperability con Nostr ecosystem

### Prediction Markets ≠ Derivatives Trading
- Diferentes instrumentos, estrategias, APIs
- LLM-powered analysis = emerging pattern
- Social signals = alpha source

### Unified Identity Patterns
- secp256k1 = common denominator (Bitcoin, Nostr, DIDs)
- BIP44 paths = standard derivation
- Cross-protocol interoperability = possible con same key material

---

**Generado:** 2026-02-03 09:19 UTC  
**Siguiente exploración:** Buscar skills de Bitcoin node monitoring, LN channel management
