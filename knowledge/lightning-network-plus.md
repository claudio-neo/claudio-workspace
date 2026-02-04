# Lightning Network+ (LN+)

**URL:** https://lightningnetwork.plus/  
**Estudiado:** 2026-02-04 13:44 UTC  
**Solicitado por:** Daniel

## ¿Qué es Lightning Network+?

Plataforma comunitaria **gratuita** para operadores de nodos Lightning que facilita:
1. **Liquidity Swaps** - Apertura coordinada de canales mutuos
2. **Liquidity Pool** - Sistema de créditos para conseguir incoming liquidity
3. **Watch Swaps** - Watchtower services mutuos
4. **Layers Academy** - Educación sobre Bitcoin/Lightning

## Problema que Resuelve

**Chicken-and-egg de Lightning:**
- Para recibir pagos necesitas **incoming liquidity** (canales que otros abren hacia ti)
- Para tener incoming liquidity, otros deben gastarse sats abriendo canales a ti
- ¿Por qué gastarían en eso si tu nodo no es conocido?

**Solución LN+:** Swaps coordinados donde múltiples nodos abren canales mutuamente.

## Herramientas Principales

### 1. Liquidity Swaps (19,379+ swaps completados)

**Concepto:** N participantes acuerdan abrir canales siguiendo un patrón.

**Tipos de swaps:**

#### Triangle Swap (3 nodos)
```
NodeA → NodeB (abre canal)
NodeB → NodeC (abre canal)
NodeC → NodeA (abre canal)
```
**Resultado:** Cada nodo tiene 1 incoming + 1 outgoing channel

#### Pentagon (5 nodos), Hexagon (6), etc.
Similar pero con más participantes = más diversificación

#### Dual (2 nodos)
```
NodeA ⇄ NodeB
```
Ambos abren canal al otro simultáneamente.

**Tamaños típicos:**
- **Extra Small:** 100,000 sats (0.001 BTC)
- **Small:** 500k - 1M sats
- **Medium:** 2.5M - 5M sats
- **Large:** 10M+ sats

**Proceso:**
1. Aplicas a un swap existente o creas uno nuevo
2. Cuando se llena, todos reciben notificación
3. Abres canal al nodo asignado (según el patrón)
4. Esperas que otros hagan lo mismo
5. Calificas a los participantes (reputación)

**Beneficios:**
- Consigues incoming liquidity "gratis" (solo pagas fees de apertura)
- Diversificas tus canales
- Conoces otros operadores de nodo
- Builds reputación en la plataforma

### 2. Liquidity Pool

**Sistema de créditos:**
- Abres canal a alguien → Ganas créditos
- Usas créditos → Otros abren canales a ti
- Puedes comprar créditos con sats si no quieres abrir canales

**Rankings:** Nodos tienen ranks (Tungsten, Silver, Gold) basados en:
- Capacidad total
- Número de canales
- Reputación
- Participación activa

**Ejemplo de nodo Top:**
- **DarthPikachu** (Rank 8/Gold)
  - Capacity: 2.113 BTC
  - Channels: 112
  - Liquidity Credits: 142,254 sats
  - Ratings: 100% happy (79 ratings)

### 3. Watch Swaps

**Watchtower mutual agreements:**
- Proteges el nodo de alguien con watchtower
- Ellos protegen el tuyo
- Útil para nodos que están offline frecuentemente

**Tamaños:**
- Extra Small, Small, Medium, Large (según capacity del nodo)

**Duración:**
- Típicamente 3-6 meses

### 4. Layers Academy

Cursos gratuitos sobre:
- Bitcoin Essentials
- Introduction to Bitcoin
- Lightning Network basics

## Requisitos para Participar

### Mínimo absoluto:
1. ✅ **Nodo Lightning sincronizado**
2. ❌ **Al menos 1 canal abierto** (para registrarse)
3. ❌ **Fondos on-chain** (para abrir canales en swaps)

### Recomendado:
- Nodo público (clearnet o Tor accesible)
- ~5M sats disponibles para empezar
- Conocimiento básico de gestión de canales
- Reputación (se construye participando)

## Autenticación (LN Sign In)

**Método:** Message signing con tu nodo

**Proceso:**
1. Página genera challenge único:
   ```
   lnplus-login-d88d491-1803f1f-02cc09d
   ```

2. Firmas el mensaje con tu nodo:
   ```bash
   lncli signmessage "lnplus-login-d88d491-1803f1f-02cc09d"
   ```

3. Pegas la firma en el formulario

4. Plataforma verifica la firma contra tu node pubkey

**Seguridad:** No compartes private keys, solo firmas un mensaje.

## Mi Situación Actual

**Node Info:**
- **Pubkey:** `02c8e87a7ab29092eba909533919c508839aea48d8e6a88c39c42a0f198a5f6401`
- **Alias:** `02c8e87a7ab29092eba9`
- **Version:** LND v0.20.0-beta
- **Network:** mainnet
- **Synced:** ✅ Yes (chain + graph)
- **Active Channels:** 0
- **Pending Channels:** 0
- **Peers:** 2
- **On-chain Balance:** 0 sats
- **URIs:** [] (no public address yet)

**Status:** ✅ Nodo operativo, ❌ Sin canales, ❌ Sin fondos

## Para Entrar en LN+

### Paso 1: Conseguir Fondos On-Chain
**Necesito:** ~1-5M sats iniciales para:
- Abrir primer canal (~500k-1M)
- Participar en primeros swaps
- Cubrir fees on-chain

**Opciones:**
- Pedir a Daniel que fondee
- Usar earnings del bot Telegram (cuando tengamos usuarios)
- Intercambio via algún servicio

### Paso 2: Abrir Primer Canal

**Targets recomendados para primer canal:**
- Nodos conocidos/estables
- High uptime
- Buena conectividad

**Opciones:**
- ACINQ (nodo de Phoenix/Eclair)
- Bitrefill
- LNBig
- WalletOfSatoshi (si aún están)

**Comando:**
```bash
lncli openchannel --node_key <pubkey> --local_amt <sats>
```

### Paso 3: Registrarse en LN+

1. Ir a https://lightningnetwork.plus/ln_sign_in
2. Copiar el challenge message
3. Firmar con: `lncli signmessage "<challenge>"`
4. Pegar signature
5. Completar profile

### Paso 4: Participar en Primer Swap

**Recomendación:** Empezar con Triangle Swap pequeño
- **Tamaño:** 100k - 500k sats
- **Tipo:** Triangle (3 nodos)
- **Red:** Cualquiera (clearnet o Tor)

**Criterios para elegir swap:**
- Participantes con buena reputación
- Sin restricciones complicadas
- Tamaño que puedo afrontar

### Paso 5: Rating & Reputación

Después del swap:
- Calificar a participantes
- Recibir calificaciones
- Build reputación para futuros swaps

## Estrategia Recomendada

### Fase 1: Setup Inicial (Requiere funding)
1. Recibir 2-3M sats on-chain
2. Abrir 1-2 canales a nodos conocidos (~1M sats c/u)
3. Registrarse en LN+

### Fase 2: Primeros Swaps (100k-500k sats)
1. Participar en 2-3 Triangle swaps pequeños
2. Build reputación
3. Aprender el proceso

### Fase 3: Escalamiento (1M-5M sats)
1. Participar en swaps más grandes
2. Diversificar canales
3. Considerar Liquidity Pool

### Fase 4: Mantenimiento
1. Monitor channel balance
2. Rebalancing cuando necesario
3. Participar en nuevos swaps periódicamente

## Costos Estimados

### Setup Inicial:
- **On-chain deposit fee:** ~500-2000 sats (según network congestion)
- **Channel open fee:** ~500-2000 sats por canal
- **Total inicial:** ~3-5k sats en fees

### Por Swap:
- **Channel open:** ~500-2000 sats
- **Commitment tx reserve:** Ninguno (parte de channel capacity)

### Mantenimiento:
- **Rebalancing:** Variable (fees de routing)
- **Channel closes:** ~500-2000 sats (idealmente evitar)

## Beneficios Esperados

### Inmediatos:
- Incoming liquidity para recibir pagos
- Diversificación de canales
- Conexión a la red Lightning

### Mediano plazo:
- Capacidad de routing (earn fees)
- Mejor conectividad
- Reputación en la comunidad

### Largo plazo:
- Nodo routing node rentable
- Parte integral de Lightning Network
- Posibilidad de ofrecer servicios

## Métricas de Éxito

**Nodo saludable:**
- 10+ canales activos
- 50%+ incoming liquidity ratio
- Uptime >99%
- Routing successful >95%
- Reputación 100% en LN+

**Nodo rentable:**
- Fees earned > Fees paid (on-chain + routing)
- Positive ROI en capital bloqueado
- Consistent routing volume

## Recursos

- **Sitio:** https://lightningnetwork.plus/
- **Swaps:** https://lightningnetwork.plus/swaps
- **Pool:** https://lightningnetwork.plus/pool
- **Academy:** https://lightningnetwork.plus/academy
- **Sign In:** https://lightningnetwork.plus/ln_sign_in

## Conclusión

**Puedo entrar técnicamente:** ✅ Sí, tengo nodo operativo  
**Bloqueador actual:** ❌ No tengo fondos ni canales abiertos  
**Siguiente paso:** Conseguir 2-5M sats para funding inicial

**Pregunta para Daniel:** ¿Quieres que empiece participando en LN+? ¿Me fondeas el nodo para abrir primeros canales?

---

**Status:** Estudiado y documentado  
**Listo para:** Abrir canales cuando tenga fondos  
**Ventaja:** Plataforma probada (19k+ swaps completados)
