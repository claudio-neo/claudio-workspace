# Lightning Network — Fundamentos

**Fecha:** 2026-02-02 02:40 UTC  
**Fuente:** Conocimiento del modelo base (pre-training) + análisis propio  
**Contexto:** Nightshift learning (lunes = Lightning Network deep dive)

## 1. Payment Channels — Arquitectura

### Canal Bidireccional
- **Opening tx:** On-chain 2-of-2 multisig creation
- **Commitment transactions:** Pre-signed txs that can close channel with current state
- **Balance sheet:** Off-chain state (Alice: X sats, Bob: Y sats)
- **Revocation mechanism:** Penalty for broadcasting old state = lose ALL funds

### Estado del Canal
```
Canal: Alice ↔ Bob (1M sats capacity)

t0: Open
  Alice: 1,000,000 | Bob: 0

t1: Alice paga 200k a Bob
  Alice: 800,000 | Bob: 200,000

t2: Bob paga 50k a Alice
  Alice: 850,000 | Bob: 150,000
```

**Problema:** ¿Cómo evitar que Alice transmita el estado t0 donde tenía más?  
**Solución:** Revocation keys — estado viejo = pérdida total (penalty).

---

## 2. HTLCs — Hash Time-Locked Contracts

### Problema
Alice quiere pagar a Charlie, pero no tiene canal directo. Necesita routear via Bob.

### Solución: HTLC
**Dos condiciones:**
1. **Hash lock:** Receptor cobra SI revela preimage de hash H
2. **Time lock:** Si timeout expira sin preimage → fondos vuelven al sender

### Routing Example: Alice → Bob → Charlie (100 sats)
```
1. Charlie: genera secreto S, hash H = hash(S)
2. Charlie → Alice: "Págame revelando preimage de H" (invoice)
3. Alice → Bob: HTLC(101 sats, H, timeout=144 blocks)
4. Bob → Charlie: HTLC(100 sats, H, timeout=72 blocks)
5. Charlie revela S → cobra 100 de Bob
6. Bob revela S → cobra 101 de Alice
7. Resultado: Charlie +100, Bob +1 (fee), Alice -101
```

**Seguridad:** Timelock decrecientes (144 > 72) garantizan que intermediario puede recuperar fondos ANTES de devolverlos.

### Si Charlie No Coopera
- Bob timeout (72) → Bob recupera sats
- Alice timeout (144) → Alice recupera sats
- Nadie pierde, pero canal se congestó

---

## 3. Routing & Pathfinding

### Gossip Protocol
LN no tiene mempool global. Cada nodo anuncia:
- Existencia de canales (verificable on-chain)
- Capacidad total
- Fees (base + proportional)
- Políticas (min/max HTLC, timelock delta)

### Pathfinding
1. Sender construye grafo de red conocida
2. Dijkstra modificado → ruta de menor costo
3. Onion routing → cada hop solo conoce: anterior, siguiente, fee

### Problema de Liquidez
- Gossip solo dice capacidad TOTAL, no distribución
- Canal 1M sats puede ser: 1M/0, 500k/500k, 0/1M
- Pathfinding = guess + retry fallidos

**Mejoras:**
- Trampoline routing (delegar a nodos grandes)
- MPP (Multi-Path Payments) — split en rutas múltiples
- AMP (Atomic Multi-Path) — MPP sin invoice

---

## 4. Economía del Lightning Network

### Modelo de Ingreso
```
Ingreso = (# pagos enrutados) × (fee promedio)
Costo = (on-chain fees) + (costo de capital)

Rentabilidad = función de:
  - Topología (qué tan conectado estás)
  - Liquidez (cuán balanceados tus canales)
  - Competencia (fees de otros nodos)
```

### Trade-offs Pruned Node
- ✅ Ahorra 500GB+ disco
- ❌ Puede fallar rescanning txs
- ❌ No sirve histórico a otros LND nodes
- **Verdict:** Viable para nodo personal, NO para routing profesional

### Tipos de Nodos
- **Personal payment node:** 2-5 canales, prune OK, objetivo = pagar/recibir
- **Routing node:** 50-200 canales, full node + txindex, objetivo = fees
- **Enterprise routing:** 500+ canales, hardware dedicado, watchtowers

---

## 5. Lecciones Clave

### 1. Seguridad Heredada de Bitcoin
- LN no mina bloques, hereda seguridad de Bitcoin L1
- Commitment txs = "amenazas creíbles" para forzar on-chain
- Economía de Bitcoin (fees, congestión) define economía de LN

### 2. Liquidez = Recurso Escaso
- **Inbound capacity:** Cuánto pueden enviarte
- **Outbound capacity:** Cuánto puedes enviar
- Balancear liquidez = desafío principal

### 3. Trust-Minimized, No Trustless
- Necesitas estar online (o watchtower) para reclamar penalty
- Force-close = unilateral pero costoso (on-chain fees)
- Delegación de confianza posible (watchtowers)

### 4. Privacidad Mejorada
- Pagos NO son broadcast global
- Solo los hops en ruta conocen el flujo
- Mucho más privado que Bitcoin on-chain

### 5. Limitaciones Actuales
- Requiere estar online (vs Bitcoin)
- Canales grandes = capital locked = riesgo
- UX compleja (inbound liquidity)

---

## 6. Aplicación Práctica — Nuestro LND Node

### Objetivo
Personal payments, NO routing profesional.

### Decisiones Basadas en Análisis
1. **Prune=550 aceptable** — no necesitamos routing profesional
2. **No txindex** — suficiente para pagos propios
3. **2-5 canales bien elegidos** — con nodos grandes (ACINQ, Bitrefill)
4. **Canales 1-2M sats** — no tiny, no huge
5. **Balance inicial:** 100% local (outbound), luego comprar inbound
6. **Fees bajos:** 1-10 ppm (no buscamos ingreso)

### Backup Crítico
- `channel.db` = vida o muerte
- Perder channel.db + peer cierra con estado viejo = pérdida total
- **Necesitamos backup automático fuera del servidor**

### Próximos Pasos (Aprobación Daniel)
1. Reducir bitcoind dbcache (2048→512) para liberar RAM
2. Iniciar LND
3. Crear wallet + seed OFFLINE (papel/metal)
4. Esperar sync LND
5. Abrir primer canal (ACINQ o similar, 1-2M sats)

---

**Conexión con Lecturas:**
- **Sovereign Individual:** LN = cybercommerce layer (predicted)
- **Softwar:** PoW secures base layer; LN inherits that security
- **Bitcoin Standard:** Hard money needs fast payments; LN solves that

---

*Documentado: 2026-02-02 02:45 UTC*
