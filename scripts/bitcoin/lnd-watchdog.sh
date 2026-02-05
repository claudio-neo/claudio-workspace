#!/bin/bash
# LND Watchdog — checks if LND is running, restarts + auto-unlocks if not
# Designed for crontab: */5 * * * * /home/neo/.openclaw/workspace/scripts/bitcoin/lnd-watchdog.sh

LNCLI="/home/neo/lnd-linux-amd64-v0.20.0-beta/lncli"
LND="/home/neo/lnd-linux-amd64-v0.20.0-beta/lnd"
LNDDIR="/home/neo/.lnd"
PASS_FILE="$LNDDIR/wallet_password"
LOG="/home/neo/.lnd/watchdog.log"

log() { echo "$(date -u +%Y-%m-%dT%H:%M:%SZ) $1" >> "$LOG"; }

# Check if LND process exists
if ! pgrep -x lnd > /dev/null 2>&1; then
    log "LND not running — starting..."
    nohup $LND --lnddir=$LNDDIR >> "$LNDDIR/lnd-start.log" 2>&1 &
    sleep 10
    
    if pgrep -x lnd > /dev/null 2>&1; then
        log "LND started (PID $(pgrep -x lnd))"
    else
        log "CRITICAL: LND failed to start"
        exit 1
    fi
fi

# Check if wallet is locked (try getinfo)
INFO=$($LNCLI --lnddir=$LNDDIR --network=mainnet getinfo 2>&1)
if echo "$INFO" | grep -q "wallet locked"; then
    if [ -f "$PASS_FILE" ]; then
        log "Wallet locked — unlocking..."
        RESULT=$(cat "$PASS_FILE" | $LNCLI --lnddir=$LNDDIR --network=mainnet unlock --stdin 2>&1)
        if echo "$RESULT" | grep -q "successfully unlocked"; then
            log "Wallet unlocked OK"
        else
            log "Unlock FAILED: $RESULT"
            exit 1
        fi
    else
        log "Wallet locked but no password file at $PASS_FILE"
        exit 1
    fi
elif echo "$INFO" | grep -q "identity_pubkey"; then
    # All good — optionally log health
    PEERS=$(echo "$INFO" | python3 -c "import sys,json; print(json.load(sys.stdin).get('num_peers',0))" 2>/dev/null)
    BLOCK=$(echo "$INFO" | python3 -c "import sys,json; print(json.load(sys.stdin).get('block_height',0))" 2>/dev/null)
    # Only log every hour (check if last log was >55 min ago)
    LAST=$(tail -1 "$LOG" 2>/dev/null | cut -c1-19)
    if [ -z "$LAST" ] || [ $(( $(date +%s) - $(date -d "${LAST}" +%s 2>/dev/null || echo 0) )) -gt 3300 ]; then
        log "OK peers=$PEERS block=$BLOCK"
    fi
else
    log "LND unresponsive: $INFO"
fi
