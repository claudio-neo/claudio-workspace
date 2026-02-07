# Lightning Bot Dashboard - Backup

**Fecha:** 2026-02-07 19:54 UTC  
**Razón:** Backup solicitado por Daniel - "Otro agente se lo ha cargado"

## Estado del Dashboard

✅ **Dashboard funcionando correctamente** al momento del backup

### Archivos respaldados
- `server.js` - API server (Express + SQLite read-only)
- `public/index.html` - Frontend (SPA con fetch API)
- `public/.htaccess` - Cache control
- `start.sh` - Script de inicio

### Configuración
- Puerto: 8091
- Auth: Caddy proxy (Basic Auth)
- Database: `~/lightning-telegram-bot/bot.db` (read-only)

### API Endpoints
- `/api/stats` - Dashboard stats
- `/api/transactions/recent` - Recent transactions
- `/api/users` - User balances
- `/api/invoices/pending` - Pending invoices
- `/api/groups` - Group configs
- `/api/support` - Support messages
- `/api/swaps` - Swap requests
- `/api/logs/activity` - Activity log
- `/api/logs/bot` - Bot log

### Últimos cambios (2026-02-07)
1. Añadido `totalCapital` a stats (capital de Daniel)
2. Dashboard muestra "Capital Reserva", "Total Fondos", "Balance Neto"
3. Orden de transacciones: `ORDER BY id DESC` (más nuevo primero)
4. Separación de balances: usuarios vs BOT_CAPITAL (telegram_id = -1)

## Restauración

Si el dashboard se rompe:

```bash
cd ~/lightning-telegram-bot/dashboard
cp ~/.openclaw/workspace/backups/lightning-bot-dashboard/* .
killall -9 node
nohup node server.js > dashboard.log 2>&1 &
```

## Git

**Repo original:** `claudio-neo/lightning-telegram-bot` (SSH falla, no pusheado)  
**Backup repo:** `claudio-neo/claudio-workspace/backups/lightning-bot-dashboard` ✅

## Verificación

```bash
curl http://localhost:8091/api/stats
```

Debería devolver JSON con stats del bot.
