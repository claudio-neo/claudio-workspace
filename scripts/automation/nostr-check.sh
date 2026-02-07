#!/bin/bash
# Nostr Notifications Check - Automated
# Runs every 6 hours, only triggers OpenClaw if new mentions/replies

set -e

WORKSPACE="/home/neo/.openclaw/workspace"
LOG_FILE="$WORKSPACE/logs/nostr-auto.log"
mkdir -p "$WORKSPACE/logs"

timestamp() {
    date -u +"%Y-%m-%d %H:%M:%S UTC"
}

log() {
    echo "[$(timestamp)] $1" | tee -a "$LOG_FILE"
}

log "Checking Nostr notifications..."

cd "$WORKSPACE/scripts/nostr"
RESULT=$(node check-notifications.js 2>&1)

echo "$RESULT" >> "$LOG_FILE"

# Parse results (simple grep for now)
if echo "$RESULT" | grep -q "New replies: 0" && echo "$RESULT" | grep -q "New mentions: 0"; then
    log "No new notifications - no action needed"
else
    log "New notifications detected"
    # TODO: Alert OpenClaw when webhook ready
    # For now, just log
fi
