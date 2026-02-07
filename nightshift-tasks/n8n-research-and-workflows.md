# N8N Research & Advanced Workflows

**Creado:** 2026-02-07 15:16 UTC  
**Tarea:** Investigar n8n en profundidad y crear workflows útiles (no solo cron)  
**Origen:** Daniel - "investiga, úsalo (no como un simple cron) y haz workflows que te sirvan"

---

## Estado Actual

**✅ Workflows básicos desplegados:**
- Heartbeat health checks (cada hora)
- Conversation backups (cada 6h)
- Nostr notifications (cada 6h)

**⚠️ Limitación:** Estos son solo "cron con UI". No aprovechan las capacidades de n8n.

---

## Capacidades de N8N a Investigar

### 1. Webhooks (Event-Driven)
**En vez de:** Polling cada X minutos  
**Usar:** Webhooks que reciben eventos en tiempo real

**Casos de uso:**
- Webhook para recibir alertas de scripts → analizar → solo llamar Claude si necesario
- GitHub webhooks (push notifications, issues)
- Bitcoin node events (nueva transacción, nuevo bloque)
- Lightning payments received

### 2. HTTP Request Nodes
**Llamar APIs externas:**
- Bitcoin mempool.space API (fee estimates, network stats)
- Lightning node APIs (check channels, rebalance)
- Nostr relay stats
- Weather, news feeds, etc.

### 3. Conditional Logic (IF/SWITCH)
**Tomar decisiones en workflows:**
- IF disk usage >90% → alert
- IF Bitcoin fee >50 sat/vB → wait to consolidate UTXOS
- IF Nostr mention is spam → ignore, else → alert me
- SWITCH basado en tipo de evento

### 4. Data Transformation
**Manipular JSON, filtrar, formatear:**
- Parse Bitcoin RPC responses
- Extract relevant data from APIs
- Format notifications para Telegram
- Aggregate stats from multiple sources

### 5. Error Handling
**Retry logic, fallbacks:**
- IF API call fails → retry 3 times → alert if still failing
- IF Bitcoin node unreachable → try backup node
- Graceful degradation

### 6. Loops & Iterations
**Procesar múltiples items:**
- Loop through Nostr mentions → filter spam → respond to genuine ones
- Check multiple Lightning channels → identify low liquidity
- Process batch operations

### 7. Integrations
**Conectar servicios:**
- GitHub (commits, issues, releases)
- Telegram (enviar mensajes, inline buttons)
- Discord, Slack (si se agregan)
- RSS feeds
- Email (parse, send)

---

## Ideas de Workflows Útiles

### Workflow 1: Intelligent Nostr Monitor
**Trigger:** Webhook cada 6h (o cada 1h)  
**Flow:**
1. Check Nostr notifications
2. **IF** new mentions > 0:
   - **GET** each mention content
   - **FILTER** spam (regex patterns, known spammers)
   - **IF** genuine mention → format notification
   - **HTTP** POST to OpenClaw webhook (cuando esté configurado)
3. **ELSE** do nothing

**Ventaja:** Solo alerto cuando hay menciones REALES, no cada 6h.

### Workflow 2: Bitcoin Fee Monitor
**Trigger:** Every 30 minutes  
**Flow:**
1. **HTTP** GET mempool.space/api/v1/fees/recommended
2. **IF** fastestFee < 10 sat/vB:
   - **ALERT** "Good time to consolidate UTXOs"
3. **IF** fastestFee > 100 sat/vB:
   - **ALERT** "Fees very high, delay non-urgent txs"

**Ventaja:** Proactive fee monitoring, no manual checking.

### Workflow 3: Lightning Channel Health
**Trigger:** Every 2 hours  
**Flow:**
1. **CODE** node: lncli listchannels
2. **FOR EACH** channel:
   - Calculate local/remote balance ratio
   - **IF** ratio < 0.2 or > 0.8 → channel needs rebalancing
3. **IF** unbalanced channels found → format report → alert

**Ventaja:** Mantener canales balanceados para mejor routing.

### Workflow 4: GitHub Activity Monitor
**Trigger:** Webhook (GitHub push events)  
**Flow:**
1. Receive push event from claudio-neo repositories
2. **IF** push to master branch:
   - **EXTRACT** commit messages
   - **FORMAT** summary
   - **POST** to Telegram (optional)
3. **IF** new issue opened:
   - **ALERT** "New issue needs attention"

**Ventaja:** Stay updated on repo activity sin manual checking.

### Workflow 5: Bitcoin News Aggregator
**Trigger:** Every 6 hours  
**Flow:**
1. **HTTP** GET RSS feeds (Bitcoin Magazine, Blockstream blog, etc.)
2. **FILTER** new articles since last check
3. **IF** keywords match ("Lightning", "privacy", "self-custody"):
   - **EXTRACT** title + link
   - **FORMAT** digest
   - **STORE** or **ALERT**

**Ventaja:** Curated news feed, no noise.

### Workflow 6: Smart Alerting System
**Trigger:** Webhook endpoint (/alert)  
**Flow:**
1. Receive alert from any script (Bitcoin node, disk, etc.)
2. **SWITCH** based on severity:
   - **CRITICAL** → immediate Telegram notification
   - **WARNING** → accumulate, send digest every hour
   - **INFO** → log only
3. **IF** same alert repeats 3+ times → escalate to CRITICAL

**Ventaja:** Intelligent alert routing, no spam.

### Workflow 7: Automated Nostr Engagement
**Trigger:** Every 12 hours  
**Flow:**
1. **HTTP** GET trending Nostr posts (via relay API)
2. **FILTER** posts by keywords (bitcoin, lightning, sovereignty)
3. **FOR EACH** relevant post:
   - **IF** not spam AND high engagement:
     - **TRIGGER** OpenClaw webhook with post content
     - Claude decides whether to reply
4. **LIMIT** to max 2 posts per run

**Ventaja:** Proactive engagement, not reactive.

### Workflow 8: LND Auto-Unlock (Secure)
**Trigger:** On LND startup detection  
**Flow:**
1. **IF** LND not responding → wait 30 seconds
2. **IF** LND wallet locked:
   - **READ** encrypted password from secure storage
   - **DECRYPT** using environment variable key
   - **EXEC** lncli unlock
3. **IF** unlock success → log, else → alert

**Ventaja:** Auto-unlock after server reboot (secure implementation required).

---

## Research Tasks (Nightshift)

### Phase 1: Exploration
- [ ] Read n8n documentation (workflows, nodes, best practices)
- [ ] Explore available nodes in n8n UI
- [ ] Test webhook functionality
- [ ] Test HTTP request nodes with real APIs

### Phase 2: Implementation
- [ ] Create Workflow 1 (Intelligent Nostr Monitor)
- [ ] Create Workflow 2 (Bitcoin Fee Monitor)
- [ ] Create Workflow 6 (Smart Alerting System with webhook)
- [ ] Test all workflows in production

### Phase 3: Integration
- [ ] Configure OpenClaw webhook to receive n8n alerts
- [ ] Connect n8n workflows to Telegram for notifications
- [ ] Setup GitHub webhooks for repo monitoring
- [ ] Document all workflows

### Phase 4: Optimization
- [ ] Review execution logs, identify failures
- [ ] Add error handling to all workflows
- [ ] Optimize trigger frequencies based on data
- [ ] Create dashboard view of all workflows

---

## Success Criteria

**Good n8n usage:**
- ✅ Workflows respond to events (webhooks), not just time
- ✅ Conditional logic reduces noise (alert only when needed)
- ✅ Integration between services (Bitcoin + Nostr + Telegram)
- ✅ Data transformation (parse, filter, format)
- ✅ Error handling (retries, fallbacks)

**Bad n8n usage:**
- ❌ Just replacing cron jobs with Schedule Trigger
- ❌ No conditional logic (fire every time regardless)
- ❌ No data processing (just run commands)

---

## Resources

- n8n Docs: https://docs.n8n.io/
- n8n Workflows Library: https://n8n.io/workflows/
- Current n8n instance: https://n8n.neofreight.net
- API Key: stored in environment

---

## Notes

- This is a **nightshift research task**
- Goal: Make n8n a powerful automation hub, not just "cron with UI"
- Experiment freely, break things, learn
- Document learnings for future reference

---

**Priority:** Medium-High (Daniel explicitly requested this)  
**Time estimate:** 3-4 hours for Phase 1+2  
**Expected outcome:** 3-5 advanced workflows that demonstrate n8n capabilities

---

*Created 2026-02-07 for nightshift execution*
