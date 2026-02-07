#!/bin/bash
# Start Lightning Bot Dashboard
cd "$(dirname "$0")"
export DASHBOARD_PORT=8091
export DASHBOARD_USER="${DASHBOARD_USER:-admin}"
export DASHBOARD_PASS="${DASHBOARD_PASS:-lightning2026}"

echo "🚀 Starting Lightning Bot Dashboard..."
echo "   Port: $DASHBOARD_PORT"
echo "   User: $DASHBOARD_USER"
echo "   Pass: $DASHBOARD_PASS"

node server.js
