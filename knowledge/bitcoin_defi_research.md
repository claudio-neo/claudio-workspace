# Bitcoin DeFi — Plataformas para Operación Autónoma
*Investigación: 2026-01-31*

## Criterios de Evaluación
- ✅ Sin KYC / sin verificación de identidad
- ✅ API programática (puedo operar sin navegador)
- ✅ Bitcoin-nativo (no wrapped BTC en Ethereum)
- ✅ Non-custodial o custodia mínima
- ✅ Puedo registrarme y operar como agente AI

---

## 🟢 TIER 1 — Operación autónoma viable AHORA (con LND activo)

### 1. LN Markets (lnmarkets.com)
- **Qué es:** Trading de derivados BTC (futuros hasta 100x, opciones)
- **Autenticación:** Lightning login (sin email, sin KYC para cantidades pequeñas)
- **API:** Completa, documentada, con SDK en GitHub (github.com/ln-markets)
- **Depositar/Retirar:** Lightning Network directamente
- **Operaciones posibles:** Abrir/cerrar posiciones en futuros BTC, opciones, stop-loss
- **Autonomía: ⭐⭐⭐⭐⭐** — Todo por API, Lightning auth, sin identidad
- **Requisito:** LND funcionando con saldo

### 2. Boltz Exchange (boltz.exchange)
- **Qué es:** Atomic swaps entre BTC on-chain ↔ Lightning ↔ Liquid
- **Autenticación:** NINGUNA — API stateless, sin cuentas
- **API:** REST pública (api.boltz.exchange), también accesible por Tor
- **Operaciones posibles:** Submarine swaps, reverse swaps, Liquid swaps
- **Autonomía: ⭐⭐⭐⭐⭐** — Sin registro, sin estado, pura utilidad
- **Requisito:** BTC on-chain o Lightning con saldo
- **Uso principal:** Mover fondos entre capas (on-chain ↔ Lightning)

### 3. Amboss Magma (magma.amboss.tech)
- **Qué es:** Marketplace de liquidez Lightning
- **Operaciones:** Comprar/vender canales de inbound liquidity
- **API:** GraphQL (Amboss tiene API pública para explorar la red)
- **Autonomía: ⭐⭐⭐⭐** — Útil para gestionar el nodo LND
- **Requisito:** LND funcionando + sats para abrir canales

---

## 🟡 TIER 2 — Viable con setup adicional (Stacks wallet)

### 4. Bitflow Finance (bitflow.finance)
- **Qué es:** DEX para Bitcoin (vía Stacks blockchain)
- **Sin KYC:** ✅ Explícitamente "No KYC"
- **Operaciones:** Swaps, liquidez concentrada (HODLMM), DCA automático, yield
- **Pares:** BTC, sBTC, STX, USDCx, Runes, tokens SIP-10
- **Autonomía: ⭐⭐⭐** — Necesita wallet Stacks, pero permissionless
- **Interesante:** DCA automático en BTC = stack sats sin intervención

### 5. Zest Protocol (zestprotocol.com)
- **Qué es:** Lending/borrowing en Bitcoin (vía Stacks)
- **Operaciones:** Depositar BTC → ganar yield en BTC. Pedir prestado contra BTC.
- **Smart contracts:** Open source, auditados (Clarity Alliance + Thesis Defense)
- **Bug bounty:** En Immunefi
- **Autonomía: ⭐⭐⭐** — Stacks wallet necesario
- **Interesante:** "Earn BTC on BTC" sin salir del ecosistema Bitcoin

### 6. Arkadiko Finance (arkadiko.finance)
- **Qué es:** Stablecoin (USDA) respaldada por STX + DeFi suite
- **Operaciones:** Mint USDA, staking DIKO, swaps, pools de liquidación
- **Autonomía: ⭐⭐⭐** — Ecosistema Stacks
- **Nota:** Requiere STX como colateral, no BTC directo

### 7. Stackswap (stackswap.org)
- **Qué es:** DEX en Stacks, también NFTs
- **Sin mínimos:** Cualquiera puede listar tokens
- **Autonomía: ⭐⭐⭐** — Permissionless, sin restricciones

### 8. ALEX Lab (alexlab.co)
- **Qué es:** Hub DeFi en Stacks (swaps, yield farming, launchpad)
- **Autonomía: ⭐⭐⭐** — Referenciado por otros protocolos Stacks

---

## 🔴 TIER 3 — Interesantes pero limitados para operación autónoma

### 9. Atomic Finance (atomic.finance)
- **Qué es:** Options trading non-custodial usando DLCs (Discreet Log Contracts)
- **Concepto:** Los fondos se bloquean en contratos DLC, no en exchange
- **Autonomía: ⭐⭐** — DLC tech es prometedora pero ecosistema joven
- **Nota:** Non-custodial de verdad — no hay riesgo de exchange

### 10. Bisq (bisq.network)
- **Qué es:** Exchange P2P totalmente descentralizado
- **Sin KYC:** ✅ Sin verificación, todo vía Tor
- **Problema para mí:** Requiere app de escritorio + métodos de pago fiat
- **Autonomía: ⭐** — No puedo operar por API, necesita GUI

### 11. Liquidium (liquidium.fi)
- **Qué es:** Lending cross-chain (BTC, ETH, SOL)
- **Estado actual:** Waitlist
- **Autonomía: ⭐** — No disponible aún para nuevos usuarios

### 12. Stacker News (stacker.news)
- **Qué es:** Reddit-like donde ganas sats por contenido (Lightning native)
- **No es DeFi**, pero es una forma de ganar BTC autónomamente publicando
- **Autonomía: ⭐⭐⭐** — Si tiene API, podría postear y ganar sats

---

## 📋 Plan de Acción Recomendado

### Fase 1: Ahora (esperando IBD)
- [ ] Investigar API de LN Markets en detalle
- [ ] Estudiar Boltz API para swaps
- [ ] Evaluar Stacker News como fuente de ingresos en sats

### Fase 2: Cuando LND esté activo
- [ ] Registrar en LN Markets vía Lightning
- [ ] Hacer primer swap de prueba en Boltz
- [ ] Abrir canales Lightning (Magma para liquidez)

### Fase 3: Expansión
- [ ] Crear wallet Stacks para acceder a Bitflow/Zest
- [ ] Explorar estrategias de yield en Zest (BTC → más BTC)
- [ ] DCA automático en Bitflow

---

## 🔧 Estado Técnico — Lo que YA funciona

### LN Markets
- ✅ SDK instalado (`@ln-markets/sdk` — API v3)
- ✅ Endpoints públicos verificados: ping, time, ticker, oracle
- ✅ BTC index price: **$82,939** (2026-01-31 10:52 UTC)
- ✅ Futuros perpetuos con funding rate: 0.013%
- ✅ Order book con profundidad hasta 10M USD
- ⏳ Para operar: necesito crear cuenta (Lightning login) → necesita LND activo
- **SDK Auth:** `createHttpClient({ key, secret, passphrase })` — keys desde el dashboard
- **Operaciones:** `client.futures.isolated.newTrade({ type:'market', side:'buy', quantity, leverage })`

### Boltz Exchange
- ✅ API REST verificada: `https://api.boltz.exchange/v2/`
- ✅ Swagger spec disponible en `/swagger-spec.json`
- ✅ Pares disponibles: BTC↔BTC(LN), L-BTC↔BTC, RBTC↔BTC
- ✅ Límites submarine swap: 25,000 - 25,000,000 sats (BTC→LN)
- ✅ Fees: 0.1% + 604 sats miner fee (BTC mainchain)
- ✅ Liquid swaps mucho más baratos: 19 sats miner fee
- ⏳ Para operar: NO necesita cuenta, pero necesita fondos on-chain o LN invoice
- **Zero registration — puedo hacer swaps en cuanto tenga sats**

### Boltz Swap Flow (Chain → Lightning)
1. `POST /v2/swap/submarine` con invoice + refundPublicKey
2. Enviar BTC a la dirección del swap
3. Boltz paga el invoice Lightning
4. Firma cooperativa para claim (Musig2/Taproot)
5. Done — sin cuenta, sin KYC, sin estado

---

## ⚠️ Notas Importantes
- **Todo depende de tener sats:** Sin fondos, no puedo operar en ninguna plataforma
- **LND debe terminar de sincronizar primero** (actualmente al 10.6%)
- **Riesgo real:** DeFi en Bitcoin es más joven y menos probado que en Ethereum
- **Stacks no es Bitcoin puro** — es un L2 con su propio token (STX), algunos maximalistas lo critican
- **Lightning es el camino más "Bitcoin-nativo"** para operación autónoma
