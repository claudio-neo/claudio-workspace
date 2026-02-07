#!/bin/bash
# Heartbeat Health Check - Automated
# Runs every hour, only alerts OpenClaw if problems detected

set -e

WORKSPACE="/home/neo/.openclaw/workspace"
LOG_FILE="$WORKSPACE/logs/heartbeat-auto.log"
mkdir -p "$WORKSPACE/logs"

timestamp() {
    date -u +"%Y-%m-%d %H:%M:%S UTC"
}

log() {
    echo "[$(timestamp)] $1" | tee -a "$LOG_FILE"
}

# Check Bitcoin node
BITCOIN_CLI="/home/neo/bitcoin-29.2/bin/bitcoin-cli"
if ! BITCOIN_INFO=$($BITCOIN_CLI getblockchaininfo 2>&1); then
    log "ERROR: Bitcoin node not responding"
    # TODO: Alert OpenClaw when webhook ready
    exit 1
fi

BLOCKS=$(echo "$BITCOIN_INFO" | jq -r '.blocks')
PROGRESS=$(echo "$BITCOIN_INFO" | jq -r '.verificationprogress')
log "Bitcoin: $BLOCKS blocks, $(echo "$PROGRESS * 100" | bc -l | cut -c1-5)% synced"

# Check disk usage
DISK_USAGE=$(df -h / | tail -1 | awk '{print $5}' | sed 's/%//')
log "Disk usage: ${DISK_USAGE}%"

if [ "$DISK_USAGE" -gt 90 ]; then
    log "WARNING: Disk usage above 90%"
    # TODO: Alert OpenClaw when webhook ready
fi

# Check memory
MEM_INFO=$(free -h | grep Mem | awk '{print $3"/"$2}')
log "Memory: $MEM_INFO"

# Check LND (if running)
if pgrep -x lnd > /dev/null; then
    LND_INFO=$(/home/neo/lnd-linux-amd64-v0.20.0-beta/lncli getinfo 2>&1 || echo "{}")
    PEERS=$(echo "$LND_INFO" | jq -r '.num_peers // 0')
    log "LND: $PEERS peers"
    
    if [ "$PEERS" -lt 3 ]; then
        log "WARNING: LND has fewer than 3 peers"
        # TODO: Alert OpenClaw when webhook ready
    fi
else
    log "INFO: LND not running (expected during IBD)"
fi

# Check own critical services (added 2026-02-07)
LNURL_STATUS=$(systemctl --user is-active lnurl-pay.service 2>&1 || echo "inactive")
CADDY_PID=$(ps aux | grep "caddy run" | grep -v grep | awk '{print $2}')

if [ "$LNURL_STATUS" != "active" ]; then
    log "WARNING: lnurl-pay.service not active ($LNURL_STATUS), attempting restart"
    systemctl --user restart lnurl-pay.service
    sleep 2
    NEW_STATUS=$(systemctl --user is-active lnurl-pay.service 2>&1)
    log "lnurl-pay restart result: $NEW_STATUS"
fi

if [ -z "$CADDY_PID" ]; then
    log "CRITICAL: Caddy not running, attempting restart"
    cd /home/neo && nohup /home/neo/caddy run --config /home/neo/Caddyfile > /tmp/caddy.log 2>&1 &
    NEW_PID=$!
    log "Caddy restarted with PID: $NEW_PID"
else
    log "Caddy running (PID: $CADDY_PID)"
fi

log "Health check completed - all OK"
