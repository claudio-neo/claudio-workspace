# Balance of Satoshis (bos) - LND Management Tool

## Overview

**GitHub:** https://github.com/alexbosworth/balanceofsatoshis  
**Author:** Alex Bosworth  
**Purpose:** Comprehensive CLI tool for managing LND nodes

**Compatibilidad:** LND v0.20.0-beta ✅ (mi versión actual)

## ¿Por Qué Me Interesa?

Daniel me lo recomendó porque tiene herramientas que pueden complementar mi implementación de NWC y gestión de LND.

## Comandos Clave Relevantes

### Gestión Básica

```bash
bos balance              # Balance total (on-chain + channels)
bos peers               # Ver peers conectados
bos report              # Reporte general del nodo
bos find <query>        # Buscar payments, channels, nodes
```

### Canales y Liquidez

```bash
bos inbound-liquidity   # Suma de liquidez inbound
bos outbound-liquidity  # Suma de liquidez outbound
bos open <pubkeys>      # Abrir canales en batch
bos open-balanced-channel  # Abrir canal balanceado
bos closed              # Ver cómo se resolvieron canales cerrados
```

### Fees

```bash
bos fees                # Ver y actualizar fee rates
bos chart-fees-earned   # Gráfico de fees ganados
bos chart-fees-paid     # Gráfico de fees pagados
bos chart-chain-fees    # Fees on-chain pagados
```

### Rebalancing (MUY RELEVANTE)

```bash
bos rebalance           # Rebalancear fondos entre peers
bos probe <destination> # Test si se pueden enviar fondos
```

**Características avanzadas:**
- Usa formulas: `--amount "capacity/2"` para 50:50 balance
- Filtros: `--in-filter`, `--out-filter`
- Evitar rutas: `--avoid "fee_rate < 100/<PUBKEY>"`

### Pagos

```bash
bos pay <invoice>       # Pagar invoice con probing primero
bos send <pubkey>       # Keysend con mensaje opcional
```

### Accounting

```bash
bos accounting <category>  # Lista formateada de transacciones
bos forwards               # Resumen de forwards hacia peers
```

### Telegram Bot

```bash
bos telegram            # Conectar a bot de Telegram
```

**Casos de uso:**
- Alertas de balance bajo
- Reportes diarios automáticos
- Control remoto del nodo

### Gateway UI

```bash
bos gateway             # Servicio gateway para https://ln-operator.github.io/
```

**UI web para gestionar el nodo visualmente.**

## Instalación

```bash
npm install -g balanceofsatoshis

# Verificar versión
bos --version
```

**Requisitos:** Node v20+ (tengo v22.22.0 ✅)

## Configuración con Mi Nodo

### Opción 1: Auto-detección (Recomendada)

Si tengo macaroon y cert en ubicaciones default:
```bash
bos balance
# Debería detectar automáticamente ~/.lnd/
```

### Opción 2: Saved Node

Crear `~/.bos/claudio/credentials.json`:

```json
{
  "cert_path": "/home/neo/.lnd/tls.cert",
  "macaroon_path": "/home/neo/.lnd/data/chain/bitcoin/mainnet/admin.macaroon",
  "socket": "127.0.0.1:10009"
}
```

Uso:
```bash
bos balance --node=claudio
```

O setear default:
```bash
export BOS_DEFAULT_SAVED_NODE=claudio
```

## Casos de Uso para Mí

### 1. Rebalancing Automatizado

**Problema:** Cuando abra canales, necesitaré balancear liquidez.

**Solución con bos:**
```bash
# Rebalancear a 50:50 con un peer
bos rebalance --out PEER_PUBKEY --amount "capacity/2"

# Rebalancear solo si fee es razonable
bos rebalance --max-fee 100

# Rebalancear evitando peers caros
bos rebalance --avoid "fee_rate > 1000"
```

### 2. Monitoreo y Alertas

**Script para cron:**
```bash
#!/bin/bash
# Alerta si balance < 1M sats
bos balance --offchain --below 1000000 | \
  /path/to/telegram-notify "Balance bajo: %s sats"
```

### 3. Auto-Ajuste de Fees

**Ejemplo:** Subir fees cuando tengo poca inbound:
```bash
# Cron cada 5 min
*/5 * * * * bos fees --set-fee-rate="IF(INBOUND<10*m,1000,500)"
```

### 4. Reporting Automático

```bash
# Daily report vía Telegram
0 9 * * * bos report | telegram-send --stdin
```

### 5. Abrir Canales en Batch

```bash
# Archivo: channels.txt
# 0337...1986 --amount=3000000
# 02a4...20de --amount=3000000

bos open $(cat channels.txt)
```

## Integración con Mi NWC

**BOS puede complementar mi NWC:**

| Función | NWC | BOS |
|---------|-----|-----|
| **Pagos programáticos** | ✅ Via Nostr | ❌ Manual CLI |
| **Rebalancing** | ❌ | ✅ Automatizado |
| **Fee management** | ❌ | ✅ Dinámico |
| **Reporting** | ❌ | ✅ Completo |
| **Telegram bot** | ❌ | ✅ Built-in |
| **Accounting** | ❌ | ✅ Detallado |

**Conclusión:** BOS es operacional, NWC es programático. Se complementan.

## Fórmulas (Feature Poderosa)

BOS permite usar expresiones matemáticas en comandos:

### Variables Disponibles

```javascript
// Globales
k = 1,000
m = 1,000,000

// En rebalance
capacity = inbound + outbound
inbound_liquidity = sats disponibles para recibir
outbound_liquidity = sats disponibles para enviar

// En fees
inbound = balance remoto
outbound = balance local
fee_rate_of_<pubkey> = fee del peer
```

### Ejemplos

```bash
# Enviar $1 (usando rate provider)
bos send <pubkey> --amount "1*usd"

# Rebalancear a exactamente 50:50
bos rebalance --amount "inbound - capacity/2"

# Fee rate como porcentaje
bos fees --set-fee-rate "percent(0.5)"  # 0.5%

# Fee rate como basis points
bos fees --set-fee-rate "bips(10)"  # 10/1000 = 1%
```

## Docker Support

```bash
docker pull alexbosworth/balanceofsatoshis

docker run -it --rm \
  -v $HOME/.bos:/home/node/.bos \
  -v $HOME/.lnd:/home/node/.lnd:ro \
  alexbosworth/balanceofsatoshis balance
```

## Casos de Uso Avanzados

### Auto-Balance Entre Dos Nodos Propios

```bash
# Cron cada 30 min
*/30 * * * * bos send PUBKEY --amount "IF(OUTBOUND>(LIQUIDITY/2), OUTBOUND-(LIQUIDITY/2), 0)"
```

### Channel Opening Rules

```bash
# Rechazar canales < 2M sats
bos inbound-channel-rules --rule "capacity < 2*m"

# Diferentes límites según privacidad
bos inbound-channel-rules --rule "if(private, capacity >= 9*m, capacity >= 5*m)"
```

### Dynamic Fee Adjustment

```bash
# Subir fees si outbound > 80%
bos fees --set-fee-rate "IF(OUTBOUND/LIQUIDITY > 0.8, 1000, 100)"
```

## Community

**Telegram:** https://t.me/balanceofsatoshis  
**Trade secret:** Hay un grupo privado de pago

**HowTos:**
- Rebalancing guides (multiple)
- Telegram bot setup
- Systemd service configuration
- Umbrel/RaspiBlitz specific guides

## Próximos Pasos

### 1. Instalar (Inmediato)
```bash
npm install -g balanceofsatoshis
bos --version
```

### 2. Probar Comandos Básicos
```bash
bos balance
bos peers
bos report
```

### 3. Setup Saved Node (Opcional)
Si la auto-detección falla, crear credentials.json

### 4. Explorar Rebalancing
Una vez que tenga canales abiertos y balance

### 5. Setup Telegram Bot (Futuro)
Para alertas y control remoto

### 6. Automatización
Cron jobs para:
- Daily reports
- Fee adjustments
- Balance monitoring

## Por Qué Daniel Me Lo Recomendó

**Razones probables:**

1. **Rebalancing:** Voy a necesitarlo cuando abra canales
2. **Accounting:** Para trackear ingresos/gastos Lightning
3. **Fees:** Optimización dinámica de fees
4. **Telegram:** Control remoto del nodo
5. **Formulas:** Lógica compleja sin scripting

**Es el estándar de facto para operadores de nodos Lightning profesionales.**

## Comparación con Alternativas

| Tool | Purpose | Language | Focus |
|------|---------|----------|-------|
| **bos** | LND management | Node.js | Operations |
| **lncli** | LND control | Go | Direct API |
| **thunderhub** | Web UI | React | Visual |
| **RTL** | Web dashboard | Angular | Monitoring |
| **NWC** | Programmatic | Nostr | Automation |

**BOS complementa, no reemplaza, mi stack actual.**

## Referencias

- GitHub: https://github.com/alexbosworth/balanceofsatoshis
- NPM: https://www.npmjs.com/package/balanceofsatoshis
- Docker Hub: https://hub.docker.com/r/alexbosworth/balanceofsatoshis
- Community guides: Multiple (see repo README)

---

**Status:** 📚 Documentado, ready para instalación  
**Prioridad:** HIGH - Daniel lo recomendó explícitamente  
**Compatibilidad:** ✅ LND v0.20.0-beta supported  
**Next:** `npm install -g balanceofsatoshis && bos --version`

*Documented: 2026-02-04 07:19 UTC*
*Recommended by: Daniel*
