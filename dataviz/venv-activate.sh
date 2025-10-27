#!/usr/bin/env bash
# activate_venv.sh — activate the virtual environment for a project

PROJ="${1:-$PROJ}"  # Use 1st argument if given, otherwise use $PROJ from environment
if [ -z "$PROJ" ]; then
    echo "Error: PROJ is empty in env" >&2
    exit 1
fi
VENV_PATH="${PROJ:-.}/.venv"

if [ -d "$VENV_PATH" ]; then
  source "$VENV_PATH/bin/activate"
  echo "✅ Virtual environment activated from: $VENV_PATH"
else
  echo "❌ .venv directory not found at '$VENV_PATH'. Run create_venv.sh first." >&2
  exit 1
fi
