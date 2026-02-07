#!/bin/bash
# Conversation Backup - Automated
# Runs every 6 hours

set -e

WORKSPACE="/home/neo/.openclaw/workspace"
LOG_FILE="$WORKSPACE/logs/backup-auto.log"
mkdir -p "$WORKSPACE/logs"

timestamp() {
    date -u +"%Y-%m-%d %H:%M:%S UTC"
}

log() {
    echo "[$(timestamp)] $1" | tee -a "$LOG_FILE"
}

log "Starting conversation backup..."

cd "$WORKSPACE"
if node scripts/utils/export-conversation.js --push >> "$LOG_FILE" 2>&1; then
    log "Backup completed successfully"
else
    log "ERROR: Backup failed (exit code $?)"
    exit 1
fi
