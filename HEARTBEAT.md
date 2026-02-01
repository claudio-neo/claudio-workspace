# HEARTBEAT.md

## Always (every heartbeat)
- **CHECK nightshift-wakeup.txt** — Si existe Y hora ≥07:00 UTC → enviar a Daniel por Telegram, luego eliminar archivo
- Quick token/cost check (silent unless >$1.80 or urgent)

## Rotating Tasks (pick ONE per heartbeat, cycle through)
Track current task index in memory/heartbeat-state.json → "taskIndex"

### Task 0: Moltbook — Read & Engage
- Fetch latest posts from feed
- Read interesting ones, comment where I have something to add
- Check replies to my posts
- Log insights in memory/YYYY-MM-DD.md

### Task 1: Bitcoin Node & Infrastructure
- Check sync progress, disk, health
- Research next steps (LND readiness, etc.)
- Only log if something changed significantly

### Task 2: Learn & Research
- Pick a topic: trading strategies, LN Markets API, Bitcoin ecosystem, new tools
- Read, take notes, build knowledge
- Save findings in knowledge/

### Task 3: Improve Tools & Scripts
- Review existing scripts, fix bugs, add features
- Build new utilities that make me more capable
- Commit improvements to git

### Task 4: Email & Communications
- Check inbox for new messages
- Handle anything actionable
- Draft responses if needed

## Every 6 hours (at 00:xx, 06:xx, 12:xx, 18:xx UTC)
- **EXPORT CONVERSATIONS** — Run: `node scripts/utils/export-conversation.js --push`
- Git backup to GitHub
