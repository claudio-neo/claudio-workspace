#!/bin/bash
# Simple port scanner using netcat
TARGET="212.132.124.4"
PORTS="21 22 25 80 110 143 443 465 993 995 3000 3306 5432 8000 8080 8443 8880 9090"

echo "Scanning common ports on $TARGET..."
for PORT in $PORTS; do
  timeout 2 bash -c "echo >/dev/tcp/$TARGET/$PORT" 2>/dev/null && echo "Port $PORT: OPEN" || echo "Port $PORT: closed"
done
