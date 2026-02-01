# HEARTBEAT.md

## Hourly Checks (every 60 minutes)
- **CHECK nightshift-wakeup.txt** — Si existe Y hora ≥07:00 UTC → enviar a Daniel por Telegram, luego eliminar archivo
- **CHECK TOKEN USAGE & COST** - Use `session_status`, report tokens used and cost estimate
- Update COST_TRACKING.md with daily totals
- Only alert if: (a) over $2 limit, OR (b) $1.80+ spent, OR (c) something urgent
- Review activity, check for pending tasks
- Otherwise: stay silent (HEARTBEAT_OK)
