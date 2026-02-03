#!/usr/bin/env bash
# switch-model.sh — Cambiar modelo de OpenClaw según tarea

set -euo pipefail

USAGE="Usage: $0 [haiku|sonnet|opus]

Switch OpenClaw model via session_status tool.

Models:
  haiku  — Fast, cheap (tareas ligeras, heartbeats, checks)
  sonnet — Balanced (default, mayoría de tareas)
  opus   — Powerful (tareas complejas, debugging, arquitectura)

Current model:
  \$(openclaw status --json | jq -r '.model')
"

if [ $# -eq 0 ]; then
  echo "$USAGE"
  exit 1
fi

MODEL="$1"

case "$MODEL" in
  haiku)
    TARGET="anthropic/claude-haiku-4-5"
    ;;
  sonnet)
    TARGET="anthropic/claude-sonnet-4-5"
    ;;
  opus)
    TARGET="anthropic/claude-opus-4-5"
    ;;
  *)
    echo "Error: Unknown model '$MODEL'"
    echo "$USAGE"
    exit 1
    ;;
esac

echo "🔄 Switching to $MODEL ($TARGET)..."

# Note: session_status tool can set model override
# But it requires interaction via OpenClaw CLI
# For now, document the command
echo ""
echo "To switch model, tell OpenClaw:"
echo "  'Switch to $MODEL model for this session'"
echo ""
echo "Or use session_status tool with model override:"
echo "  session_status(model='$MODEL')"
echo ""
echo "Current model:"
openclaw status --json 2>/dev/null | jq -r '.model' || echo "  (use 'openclaw status' to check)"
