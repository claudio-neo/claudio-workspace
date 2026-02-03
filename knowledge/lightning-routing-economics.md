# Lightning Network — Routing Economics & Liquidity Management
*Nightshift deep dive — Tuesday Feb 3, 2026 (adelanto tema miércoles)*

## Overview
Lightning Network = payment routing network sobre Bitcoin. La economía del routing determina:
- Qué canales se abren
- Cómo se balancea liquidez
- Fees cobrados
- Viabilidad económica de nodos de routing

Este análisis examina los incentivos económicos, problemas de coordinación, y estrategias óptimas.

---

## 1. Routing Algorithms — Source-Based Pathfinding

### Gossip Protocol
LN usa **gossip protocol** para compartir información de red:
- Cada nodo anuncia **channel announcements** (verificables on-chain)
- Capacidad total del canal (commitment tx amount)
- Routing policies: base fee, proportional fee, min/max HTLC, timelock delta
- Channel updates: cambios de fees o policies

**Información NO revelada:**
- **Local balance** de cada lado del canal (privacidad)
- Historial de pagos
- Liquidity distribution

**Implicación:** Sender no conoce si canal tiene liquidez suficiente en dirección necesaria.

### Source-Based Routing
**Modelo:** Sender construye ruta COMPLETA antes de enviar pago.

**Pasos:**
1. **Build graph:** Sender reconstruye grafo de red desde gossip messages
2. **Pathfinding:** Algoritmo (Dijkstra modificado) encuentra ruta de menor costo
3. **Onion packet:** Sender construye paquete onion cifrado con instrucciones por hop
4. **Forward:** Cada hop descifra su capa, forwarded a siguiente
5. **Success/Fail:** Payment succeeds o falla (insuficiente liquidez, channel offline, etc.)

**Ventajas:**
- Sender tiene control total de ruta
- Privacy: intermediarios solo ven hop anterior + siguiente (onion routing)
- Fees conocidos antes de enviar

**Desventajas:**
- **Información imperfecta:** No sabe balance real de canales remotos
- **Trial and error:** Si falla, sender prueba ruta alternativa
- **Probing attacks:** Adversario puede probar balances enviando pagos que fallan

### Pathfinding Heuristics
**Problema:** Encontrar ruta con alta probabilidad de éxito Y bajo costo.

**Métricas a optimizar:**
1. **Total fees:** Suma de base fee + proportional fee de cada hop
2. **Success probability:** P(ruta tiene liquidez suficiente)
3. **Latency:** Número de hops (más hops = más latencia + más riesgo de timeout)

**Algoritmos:**
- **Dijkstra:** Shortest path (fees como peso)
- **Yen's k-shortest paths:** Encuentra k rutas alternativas, prueba en orden
- **Probabilistic scoring:** Ajusta peso por P(success) estimado
- **Multi-path payments (MPP):** Split payment en múltiples rutas paralelas

**Ejemplo Dijkstra:**
```
Grafo:
  A --(1000 sats cap, 1 sat fee)--> B --(2000 sats cap, 2 sat fee)--> C
  A --(500 sats cap, 10 sat fee)----------------------> C

Payment: A → C (100 sats)

Dijkstra (min fees):
  Ruta 1: A → B → C (fee: 1+2 = 3 sats)
  Ruta 2: A → C (fee: 10 sats)
  
Choose: Ruta 1 (menor fee)

Problema: ¿Qué si canal B→C tiene 100 sats en lado de C (no puede forward)?
Solución: Probar Ruta 2 como fallback.
```

### Multi-Path Payments (MPP)
**Idea:** Split payment en múltiples HTLCs por rutas diferentes.

**Ventajas:**
- Mayor success probability (no depende de un solo canal con liquidez completa)
- Puede usar canales pequeños (fragmentación)
- Privacy mejorada (adversario ve múltiples pagos pequeños, no uno grande)

**Desventajas:**
- Mayor complejidad (coordinación de múltiples HTLCs)
- Mayor fee total (más rutas = más fees)
- Requiere soporte de nodo receptor (invoices con MPP flag)

**Ejemplo:**
```
Alice → Bob: 1M sats
Canales disponibles:
  A → X → B (500k capacity)
  A → Y → B (500k capacity)
  A → Z → B (300k capacity)

Sin MPP: Falla (ningún canal individual tiene 1M)
Con MPP:
  Path 1: A → X → B (400k sats, fee 40)
  Path 2: A → Y → B (400k sats, fee 40)
  Path 3: A → Z → B (200k sats, fee 20)
  Total: 1M sats, fee 100 sats
```

---

## 2. Fee Market Dynamics

### Fee Structure
Cada nodo cobra **routing fee** por forward HTLCs:
```
fee = base_fee + (amount × proportional_fee_rate)
```

**Ejemplo:**
- Base fee: 1 sat (flat)
- Proportional fee: 0.01% (1 ppm = 1 part per million)
- Amount: 100,000 sats

```
fee = 1 + (100,000 × 0.0001) = 1 + 10 = 11 sats
```

### Fee Discovery
**Problema:** ¿Cómo sabe sender qué fees cobrar?

**Respuesta:** Gossip protocol anuncia fees de cada canal.

**Actualización:** Nodo puede cambiar fees anytime via `channel_update` message.

### Fee Optimization Strategies

#### High-Liquidity Channels
**Objetivo:** Maximizar routing revenue.

**Estrategia:**
- **Low fees** → atrae más pagos
- Alta probabilidad de success (liquidez balanceada)
- Volumen alto compensa fee bajo

**Ejemplo:**
- Fee: 10 ppm (0.001%)
- Volume: 10 BTC/month
- Revenue: 10 BTC × 0.00001 = 0.001 BTC = 100k sats/month

#### Liquidity-Constrained Channels
**Problema:** Canal desbalanceado (e.g., 90% en un lado).

**Estrategia:** **Dynamic fee pricing**
- **High fee en dirección de escasez** → desincentiva uso
- **Low fee en dirección de abundancia** → incentiva rebalanceo

**Ejemplo:**
```
Canal A ↔ B:
  A: 900k sats | B: 100k sats

A → B (abundancia): fee 1 ppm (barato, quiere drenar)
B → A (escasez): fee 1000 ppm (caro, quiere conservar)
```

**Resultado:** Pagos B→A subsidian rebalanceo del canal.

#### Strategic Positioning
**Objetivo:** Ser ruta preferida para ciertos pagos.

**Factores:**
- **Geography:** Conectar clusters separados (earn bridge fees)
- **Popular nodes:** Canales con exchanges, merchants, grandes nodos
- **Underserved routes:** Identificar rutas con poca competencia

**Ejemplo:**
```
Network:
  Cluster 1: Many nodes, well-connected
  Cluster 2: Many nodes, well-connected
  Bridge: Only 3 channels connecting clusters

Strategy: Open channel bridging clusters → monopoly fees
```

### Fee Competition
**Pregunta:** ¿Hay competencia que lleve fees a zero?

**Respuesta:** NO, por varios motivos:

1. **Capital costs:** Liquidity locked in channels = opportunity cost
2. **Channel management:** Rebalancear, monitorear, on-chain fees
3. **Risk:** Counterparty puede forzar close (on-chain fees)
4. **Network topology:** No todos los nodos están igual posicionados

**Analogía:** Fees de LN ≈ shipping costs en comercio físico.
- Hay competencia, pero NO llega a zero
- Geography matters (network topology)
- Differentiation por velocidad/reliability

---

## 3. Liquidity Management — The Core Problem

### The Liquidity Problem
**Realidad:** Lightning = pre-funded liquidity.

**Constraint:** Para recibir 1 BTC, ALGUIEN debe tener canal con 1 BTC on their side pointing to you.

**Implicación:** Recipient-side liquidity es el cuello de botella.

### Inbound vs Outbound Liquidity

**Outbound liquidity:** Sats on "my side" of channels.
- Puedo ENVIAR pagos
- Fácil de obtener (solo abrir canales)

**Inbound liquidity:** Sats on "their side" pointing to me.
- Puedo RECIBIR pagos
- **Difícil de obtener** (requiere que otros abran canales o yo gaste)

**Ejemplo:**
```
Alice abre canal con Bob (1M sats):
  Alice: 1M | Bob: 0

Alice outbound: 1M (puede enviar)
Alice inbound: 0 (NO puede recibir)

Alice paga 500k a Bob:
  Alice: 500k | Bob: 500k

Alice outbound: 500k
Alice inbound: 500k (ahora puede recibir hasta 500k)
```

### Strategies to Acquire Inbound Liquidity

#### 1. Spend First
**Método:** Gastar sats para mover balance al otro lado.

**Ventajas:**
- Gratis (excepto fees de compra)
- Usa el canal productivamente

**Desventajas:**
- Requiere tener qué comprar
- Lento (necesitas gastar cantidad significativa)

#### 2. Dual-Funded Channels
**Método:** Ambos lados depositan fondos al abrir canal.

**Ventajas:**
- Liquidez balanceada desde inicio
- Ambos pueden send/receive

**Desventajas:**
- Requiere counterparty cooperativa
- No estándar aún (propuesta BOLT12)

#### 3. Liquidity Marketplace
**Método:** Pagar a alguien para abrir canal con liquidez inbound.

**Servicios:**
- **Pool (Lightning Labs):** Marketplace de liquidez
- **Magma (Amboss):** Sell/buy inbound channels
- **LN+ Swaps:** Peer-to-peer liquidity swaps

**Ejemplo Pool:**
```
Alice quiere 5M sats inbound.
Bob (en Pool) ofrece abrir canal 5M por 10k sats upfront.
Alice paga 10k, Bob abre canal con 5M on his side.
Alice ahora tiene 5M inbound.
```

**Economía:**
- Comprador paga upfront fee + routing fees futuros
- Vendedor gana upfront fee + routing fees
- Ambos ganan si canal se usa

#### 4. Submarine Swaps
**Método:** On-chain BTC → Lightning (inbound), Lightning → on-chain (outbound).

**Servicios:**
- **Boltz:** Trustless submarine swaps
- **Loop (Lightning Labs):** Loop In/Loop Out

**Loop In:**
```
Alice envía on-chain BTC → Servicio
Servicio envía LN sats → Alice
Resultado: Alice gasta outbound, recibe inbound (neto: +inbound)
```

**Loop Out:**
```
Alice envía LN sats → Servicio
Servicio envía on-chain BTC → Alice
Resultado: Alice gasta inbound, recibe outbound (neto: +outbound)
```

**Fees:** On-chain mining fee + swap service fee.

#### 5. Channel Rebalancing
**Método:** Circular payments para mover liquidez.

**Ejemplo:**
```
Alice tiene:
  Canal A: 900k outbound / 100k inbound
  Canal B: 100k outbound / 900k inbound

Rebalance:
  Alice envía 400k via A → (network) → B → Alice (circular)
  Resultado:
    Canal A: 500k outbound / 500k inbound
    Canal B: 500k outbound / 500k inbound
```

**Costo:** Routing fees de la red (puede ser caro).

**Herramientas:**
- **Balance of Satoshis (BOS):** CLI para rebalanceo automático
- **Ride the Lightning (RTL):** Web UI con rebalanceo
- **Thunderhub:** Web UI con circular rebalancing

### Liquidity as a Service (LaaS)
**Business model:** Proveer inbound liquidity a cambio de fees.

**Providers:**
- **LNBIG:** Opera ~35 BTC en LN, abre canales gratis (revenue via routing)
- **LN+:** Peer swaps coordinados
- **ACINQ (Phoenix):** Liquidez on-demand (paga via splice)

**Economía:**
- Provider gana routing fees
- Provider asume riesgo de capital locked
- Customer paga upfront o via routing fees

---

## 4. Channel Economics — Capital Efficiency

### Opportunity Cost
**Pregunta:** ¿Vale la pena lockear capital en LN?

**Costo:**
- Bitcoin locked en channels = NO gana yield
- Alternativa: Hold BTC, stake elsewhere, lend, etc.

**Revenue:**
- Routing fees
- Payment flows (si eres merchant)

**Break-even:**
```
Annual routing revenue >= Opportunity cost of capital

Ejemplo:
  Capital locked: 1 BTC
  Opportunity cost: 5% APY (hipotético)
  Break-even routing: 0.05 BTC/year = 5M sats/year
  
  Si volumen mensual es 50 BTC @ 10 ppm:
    Monthly revenue: 50 BTC × 0.00001 = 0.0005 BTC = 50k sats
    Annual revenue: 50k × 12 = 600k sats = 0.006 BTC
    
  Conclusion: 0.006 < 0.05 → NO profitable vs holding
```

**Implicación:** Routing solo es rentable si:
1. Alto volumen (muchos pagos)
2. Good positioning (strategic routes)
3. Low opportunity cost (BTC holder without better yield)

### On-Chain Costs
**Opening channel:** 1 on-chain tx (funding tx).  
**Closing channel:** 1-2 on-chain tx (mutual close o force close).

**Costo estimado (2026):**
- Fee rate: 10 sat/vB (normal)
- Opening tx: ~140 vB → 1,400 sats
- Closing tx: ~140 vB → 1,400 sats
- **Total round-trip: ~3,000 sats**

**Implicación:** Canal debe routear suficiente volumen para cubrir costos on-chain.

**Break-even volume:**
```
Fee revenue >= On-chain costs

Ejemplo:
  On-chain cost: 3,000 sats
  Avg routing fee: 10 sats/payment
  Break-even: 300 payments

Si canal promedia 10 payments/day:
  Days to break-even: 30 days
  
Conclusion: Canal debe durar >1 mes para ser rentable.
```

### Channel Lifetime
**Pregunta:** ¿Cuánto debe durar un canal?

**Factores:**
- On-chain fees (abrir + cerrar)
- Routing volume
- Liquidity drift (balance se mueve a un lado)

**Estrategias:**
1. **Long-term channels:** Con peers confiables, high-volume routes
2. **Liquidity recycling:** Close channels no rentables, open nuevos
3. **Splicing:** Ajustar capacity sin cerrar (BOLT propuesta)

---

## 5. Game Theory & Incentives

### The Liquidity Coordination Problem
**Problema:** Todos quieren **inbound** liquidity, pero proveer outbound es costly.

**Paradoja:**
- Alice quiere recibir → necesita alguien abra canal
- Bob quiere recibir → necesita alguien abra canal
- **Nadie quiere abrir primero** (altruismo no escalable)

**Solución:** **Liquidity marketplaces** (Pool, Magma) resuelven coordinación via precios.

### The Routing Node Dilemma
**Pregunta:** ¿Por qué alguien correría routing node?

**Motivaciones:**
1. **Profit:** Routing fees (si volumen es alto)
2. **Receive payments:** Merchant que necesita inbound
3. **Altruism:** Soporte a la red (hobbyistas)
4. **Strategic:** LSPs (Lightning Service Providers) monetizan servicios

**Realidad:** Mayoría de routing revenue va a **top nodes** (poder de ley).
- Top 10% nodos = 90%+ del volumen
- Long tail de nodos pequeños = poca revenue

### Attack Vectors

#### Liquidity Probing
**Ataque:** Enviar pagos destinados a fallar para descubrir balances de canales.

**Método:**
```
Attacker → A → B → Attacker (circular)
Amount: 1M sats

Si falla en A→B: balance A→B < 1M
Si falla en B→Attacker: balance B→Attacker < 1M
Si success: ambos tienen >= 1M
```

**Defensa:**
- **Just-in-time (JIT) routing:** Solo reveal balance cuando payment settling
- **Noise:** Añadir fake channel_updates con balances falsos
- **Fee structure:** Hacer probing costoso (high base fees)

#### Flood Attacks
**Ataque:** Spamear HTLCs para congestionar canales.

**Método:**
```
Attacker → Victim
Spam: 1000 HTLCs @ 1 sat cada uno
Victim channels llenos de HTLCs pending
Legit payments fail (no slots)
```

**Defensa:**
- **HTLC limits:** Max 483 HTLCs simultáneos por canal (BOLT spec)
- **Fee minimums:** Base fee hace spam expensive
- **Reputation:** Blacklist attackers

#### Griefing Attacks
**Ataque:** Lock liquidity sin pagar.

**Método:**
```
Attacker → A → B → C → Fake recipient
HTLCs locked (no preimage revealed)
Wait timeout → revert
Result: A,B,C liquidity locked sin revenue
```

**Defensa:**
- **Upfront fees:** Hold fees (propuesta, no deployed)
- **Reputation:** Trust scoring
- **Short timeouts:** Reduce lock time

---

## 6. Future Directions

### Channel Factories
**Idea:** N-party multiparty channels off a single on-chain UTXO.

**Ventajas:**
- Reduce on-chain footprint (N channels → 1 UTXO)
- Permite rebalanceo interno (sin on-chain tx)

**Desventajas:**
- Complejidad (N-party state machines)
- Liveness (todos deben firmar updates)

### Eltoo (ANYPREVOUT)
**Problema actual:** Penalty mechanism es complex (revocation keys).

**Eltoo:** Simplifica usando **SIGHASH_ANYPREVOUT**.
- Estados posteriores "override" anteriores (sin penalty)
- Reduce complejidad, mejora backup safety

**Status:** Requiere soft fork (ANYPREVOUT proposal).

### Splicing
**Problema:** Ajustar capacity requiere close + reopen.

**Splicing:** Modify channel capacity sin cerrar.
- **Splice in:** Add funds on-chain → increase capacity
- **Splice out:** Remove funds on-chain → decrease capacity

**Status:** En desarrollo (c-lightning tiene implementación experimental).

### Trampoline Routing
**Problema:** Light clients (móviles) no pueden construir rutas completas.

**Trampoline:** Light client delega pathfinding a trampoline node.
- Client → Trampoline → Destination
- Trampoline construye ruta final

**Privacy:** Trampoline sabe destination (trade-off).

---

## 7. Practical Recommendations

### For Routing Node Operators
1. **Start small:** 1-3 BTC initial capital
2. **Strategic channels:** Conectar con high-volume nodes (exchanges, LSPs)
3. **Monitor profitability:** Track fees earned vs capital locked
4. **Rebalance proactively:** Use BOS, Thunderhub
5. **Dynamic fees:** Adjust per channel state (high fees when unbalanced)

### For Merchants
1. **LSP integration:** Use Phoenix, Breez (liquidity on-demand)
2. **Pre-fund inbound:** Buy liquidity via Pool/Magma
3. **Submarine swaps:** Loop In cuando needed
4. **Multiple channels:** Don't depend on single channel

### For Users
1. **Custodial first:** Wallet of Satoshi, Blink (easiest UX)
2. **Non-custodial advanced:** Phoenix (self-custody + LSP)
3. **Full node:** Umbrel, RaspiBlitz (sovereignty)

---

## Conclusion

Lightning Network routing economics son **complejos pero racionalizables:**

1. **Pathfinding = information asymmetry game**
   - Sender tiene grafo, no balances reales
   - Trial-and-error + heuristics

2. **Fees = market-driven**
   - Competition keeps fees low
   - Strategic positioning allows premium fees
   - Dynamic pricing optimizes revenue

3. **Liquidity = scarce resource**
   - Inbound liquidity es el bottleneck
   - Marketplaces solve coordination
   - Capital efficiency crítico para profitability

4. **Game theory matters**
   - Incentives align most of the time
   - Attack vectors exist but mitigable
   - Long-term cooperation > short-term griefing

**Connection to Austrian Economics (Mises):**
- **Prices as information signals:** Fees descubren rutas óptimas
- **Entrepreneurship:** Routing nodes = entrepreneurs allocating capital
- **Spontaneous order:** Network topology emerge sin planificación central
- **Time preference:** Capital locked = lower time preference (future-oriented)

**Connection to Sovereign Individual:**
- Lightning = peer-to-peer payments, sin intermediarios
- Routing nodes = individuals providing services for profit
- Censorship resistance = onion routing + global network
- **Financial sovereignty:** Run own node = control own money

---

*Documented: 2026-02-03 02:45 UTC*
*Reading: ~30 minutes*
*Next: Bitcoin scripting & development (miércoles nightshift)*
