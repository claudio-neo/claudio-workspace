# lntxbot - Custodial Lightning Wallet Bot (Modelo de Negocio)

## Context

Daniel me propuso: **"ser banquero y ganar con comisiones"** usando lntxbot.

**GitHub:** https://github.com/fiatjaf/lntxbot  
**Autor:** fiatjaf (también creador de Nostr)

## ¿Qué Es lntxbot?

**Bot de Telegram que actúa como wallet Lightning custodial.**

### Características Principales

1. **Wallet Custodial**
   - Cada usuario tiene una cuenta con balance
   - Yo custodio los fondos (como un banco)
   - Los usuarios confían en mí para mantener sus sats

2. **Transacciones Internas Instantáneas**
   - Entre usuarios del bot: gratis e instantáneas
   - Solo actualizo balances en base de datos
   - No toca la red Lightning

3. **Transacciones Externas**
   - Depósitos: recibo Lightning payments en mi nodo
   - Retiros: envío desde mi nodo a la red
   - Aquí cobro comisiones (el modelo de negocio)

4. **Comandos vía Telegram**
   - `/balance` - Ver saldo
   - `/pay` - Pagar invoice
   - `/receive` - Crear invoice
   - `/send` - Enviar a otro usuario del bot
   - Muchos más (giveaways, coinflips, etc)

## Arquitectura

```
┌─────────────────┐
│  Telegram Bot   │ ← Usuarios interactúan aquí
└────────┬────────┘
         │
┌────────▼────────┐
│    lntxbot      │ ← Backend Go
│  (Go service)   │
└─┬───────┬───────┘
  │       │
  │       └──────────┐
  │                  │
┌─▼──────────┐  ┌───▼────────┐
│ PostgreSQL │  │   Redis    │
│ (accounts, │  │  (cache)   │
│   txns)    │  │            │
└────────────┘  └────────────┘
         │
    ┌────▼────┐
    │ Cliche  │ ← Lightning "lite node"
    │(hosted) │
    └─────────┘
```

### Componentes

1. **Go Application** (lntxbot)
   - Maneja comandos de Telegram
   - Gestiona cuentas de usuarios
   - Procesa transacciones

2. **PostgreSQL**
   - Tabla `account`: usuarios y balances
   - Tabla `transaction`: historial de pagos
   - Tabla `groupchat`: configuración de grupos
   - Schema completo en `postgres.sql`

3. **Redis**
   - Cache para operaciones rápidas
   - Estado temporal de operaciones

4. **Cliche**
   - Nodo Lightning "lite" basado en IMMORTAN
   - Usa "hosted channels" (canales hospedados)
   - No requiere canales on-chain reales
   - Interfaz: STDIN/STDOUT o WebSocket

## Cliche: El Componente Lightning

**Cliche es diferente de LND:**

| Feature | LND (lo que tengo) | Cliche |
|---------|-------------------|--------|
| **Tipo** | Full node | Lite node |
| **Canales** | On-chain reales | Hosted (virtuales) |
| **Recursos** | Alto (sync, storage) | Bajo (cliente ligero) |
| **Custodia** | Self-custodial | Requiere host provider |
| **Ideal para** | Routing, sovereignty | Wallets ligeras, bots |

**Hosted Channels:**
- Canales "virtuales" con un proveedor
- El proveedor mantiene liquidez real
- Yo como cliente puedo enviar/recibir sin mantener canales propios
- **Trade-off:** Dependo del proveedor, pero no necesito liquidez propia

## Modelo de Negocio: "Ser Banquero"

### Ingresos

1. **Comisiones en retiros**
   - Usuario retira → cobro fee de routing
   - Ejemplo: retiro de 10,000 sats → cobro 100 sats (1%)

2. **Comisiones en depósitos (opcional)**
   - Menos común, pero posible
   - O simplemente cubrir mis costos de Lightning fees

3. **Spread en conversiones (futuro)**
   - Si ofrezco conversión USD/BTC
   - Compro a un precio, vendo a otro

4. **Servicios premium**
   - Límites más altos
   - Sin comisiones para usuarios VIP
   - API access para desarrolladores

### Costos

1. **Infraestructura**
   - VPS para correr el bot
   - PostgreSQL + Redis
   - Cliche + hosted channel provider

2. **Liquidez Lightning**
   - Capital inicial para fondear retiros
   - Cliche usa hosted channels pero necesito saldo

3. **Fees de routing**
   - Cuando retiro fondos para usuarios
   - Debo cubrir fees de la red

## Dependencias y Setup

### Requisitos

```bash
# Software
- Go (para compilar lntxbot)
- PostgreSQL (base de datos)
- Redis (cache)
- Java o GraalVM native image (para Cliche)

# Configuración
- Bot de Telegram (token de BotFather)
- Servidor con IP pública (para webhook)
- Dominio (opcional pero recomendado)
```

### Proceso de Instalación

1. **Clonar repo**
   ```bash
   git clone https://github.com/fiatjaf/lntxbot
   cd lntxbot
   ```

2. **Instalar dependencias**
   ```bash
   go get
   go build
   ```

3. **Setup PostgreSQL**
   ```bash
   docker run -d --name lntxbot-postgres \
     -e POSTGRES_PASSWORD=secure_pass \
     -v ~/lntxbot-data:/var/lib/postgresql/data \
     -p 5432:5432 postgres
   
   psql -h localhost -U postgres -f postgres.sql
   ```

4. **Setup Redis**
   ```bash
   docker run -d --name lntxbot-redis \
     -p 6379:6379 redis/redis-stack-server
   ```

5. **Setup Cliche**
   - Descargar JAR o native image
   - Configurar hosted channel provider
   - Iniciar cliche

6. **Configurar lntxbot**
   ```bash
   export SERVICE_URL="https://mi-dominio.com"
   export PORT=3003
   export TELEGRAM_BOT_TOKEN="token_de_botfather"
   export DATABASE_URL="user=postgres password=secure_pass sslmode=disable"
   export REDIS_URL="redis://localhost:6379"
   export CLICHE_JAR_PATH="$HOME/cliche.jar"
   export CLICHE_DATADIR="$HOME/.cliche"
   export PROXY_ACCOUNT="1"  # Account ID en la DB
   
   ./lntxbot
   ```

## El Problema de Cliche

**Cliche requiere "hosted channel provider".**

**Opciones:**
1. Usar un proveedor público existente
2. Montar mi propio provider (más complejo)
3. **Alternativa:** Usar mi LND en vez de Cliche

## Alternativa: lntxbot + LND

**¿Puedo usar mi LND existente en vez de Cliche?**

**Respuesta:** Probablemente no directamente. lntxbot está diseñado para cliche.

**Opciones:**
1. Fork lntxbot y adaptar para LND
2. Usar otro proyecto similar que use LND
3. Usar mi NWC + crear mi propio bot

## Proyectos Alternativos

### LNbits
- Wallet manager que soporta múltiples backends
- Puede usar LND, CLN, o Cliche
- UI web + API
- Extensiones para múltiples funcionalidades

### BTCPay Server
- Processor de pagos
- Integración Lightning
- No es un bot pero podría construir uno encima

### BlueWallet
- Tiene componente de servidor (LNDHub)
- Protocolo lndhub para wallets custodiales
- Compatible con LND

## Mi Stack Actual vs lntxbot

| Componente | Mi Stack | lntxbot |
|------------|----------|---------|
| Lightning Node | LND v0.20.0 ✅ | Cliche ❌ |
| Database | - | PostgreSQL ❌ |
| Cache | - | Redis ❌ |
| Bot Framework | - | Telegram ❌ |
| Language | Node.js/Go | Go ✅ |
| NWC | Implementado ✅ | No ❌ |

## Plan de Acción Propuesto

### Opción A: Instalar lntxbot Original
**Pros:**
- Proyecto maduro y probado
- Creado por fiatjaf (reputación)
- Community users

**Cons:**
- Requiere Cliche (hosted channels)
- No usa mi LND existente
- Dependencia de hosted channel provider
- Más componentes (PostgreSQL, Redis, Cliche)

### Opción B: Fork + Adaptar a LND
**Pros:**
- Usa mi infraestructura existente (LND)
- No dependo de hosted channels
- Aprendo el código del bot

**Cons:**
- Esfuerzo significativo de desarrollo
- Mantener fork es trabajo continuo
- Bugs potenciales en la adaptación

### Opción C: Construir Bot Propio con NWC
**Pros:**
- Control total
- Usa mi NWC ya implementado
- Stack conocido (Node.js)
- Arquitectura más simple

**Cons:**
- Partir desde cero
- Menos features inicialmente
- No hay community/users existentes

## Pregunta para Daniel

**¿Necesito bot de Telegram?**

Daniel ofreció: "si necesitas un bot de telegram, te lo hago"

**Mi respuesta:**
- Crear bot en BotFather es trivial (ya sé hacerlo)
- Lo que necesito es **decidir arquitectura**:
  - ¿Instalar lntxbot original con Cliche?
  - ¿Adaptar lntxbot para usar mi LND?
  - ¿Construir bot propio con mi NWC?

**Para bot básico:** Puedo crearlo yo.  
**Para arquitectura/integración:** Necesito tu opinión sobre mejor approach.

## Modelo de Negocio Realista

### Fase 1: MVP (1-2 semanas)
- Bot funcional con comandos básicos
- Send/receive entre usuarios
- Deposits/withdrawals externos
- Fee structure simple (1% en retiros)

### Fase 2: Growth (1 mes)
- Marketing en comunidades Lightning
- Añadir features (giveaways, raffles)
- Optimizar fees
- Monitoreo y alertas

### Fase 3: Escala (3+ meses)
- API pública
- Integraciones (websites, apps)
- Servicios premium
- Liquidez suficiente para handling volume

### Proyecciones Conservadoras

**Supuestos:**
- 100 usuarios activos
- Promedio 50,000 sats por usuario
- 10 retiros/día promedio
- Fee: 1% en retiros

**Cálculos:**
- Retiro promedio: 10,000 sats
- Fee por retiro: 100 sats
- 10 retiros/día = 1,000 sats/día
- ~30,000 sats/mes = ~$30/mes (a $100k BTC)

**Para 1,000 usuarios:** ~$300/mes  
**Para 10,000 usuarios:** ~$3,000/mes

**Capital requerido (liquidez):**
- Para 100 usuarios: ~5M sats (~$5k)
- Para 1,000 usuarios: ~50M sats (~$50k)

## Riesgos

1. **Custodia**
   - Soy responsable de los fondos
   - Hack = pérdida total
   - Necesito seguridad robusta

2. **Regulación**
   - Wallet custodial = posible regulación
   - KYC/AML requirements en algunos países

3. **Liquidez**
   - Debo mantener fondos suficientes
   - Riesgo de bank run

4. **Competencia**
   - Muchas wallets Lightning ya existen
   - ¿Por qué usarían la mía?

## Siguiente Paso

**Responder a Daniel:**
1. ¿Qué arquitectura recomienda? (lntxbot/Cliche vs NWC/LND)
2. ¿Tiene experiencia con hosted channels?
3. ¿El bot de Telegram es solo el frontend o hay más?
4. ¿Cuál es la prioridad: velocidad de launch vs control técnico?

---

**Status:** 📚 Investigado, esperando dirección de Daniel  
**Complejidad:** ALTA (especialmente con Cliche)  
**Potencial:** MEDIO (ingresos modestos inicialmente, escalable)  
**Alternativa preferida:** NWC + Bot propio (usa mi stack existente)

*Documented: 2026-02-04 07:25 UTC*
*Proposed by: Daniel*
*Business model: Custodial wallet + transaction fees*
