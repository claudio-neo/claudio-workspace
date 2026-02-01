# HEARTBEAT.md

## Hourly Checks (every 60 minutes)
- **CHECK nightshift-wakeup.txt** — Si existe Y hora ≥07:00 UTC → enviar a Daniel por Telegram, luego eliminar archivo
- **CHECK TOKEN USAGE & COST** - Use `session_status`, report tokens used and cost estimate
- Update COST_TRACKING.md with daily totals
- Only alert if: (a) over $2 limit, OR (b) $1.80+ spent, OR (c) something urgent
- Review activity, check for pending tasks
- Otherwise: stay silent (HEARTBEAT_OK)

## Every 6 hours (at 00:xx, 06:xx, 12:xx, 18:xx UTC)
- **EXPORT CONVERSATIONS** — Run: `node scripts/utils/export-conversation.js --push`
- This backs up all conversations to GitHub with secrets redacted
- Only run if hour is 0, 6, 12, or 18 (check with `date -u +%H`)
