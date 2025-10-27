#!/bin/bash

REQ="requirements.txt"
PROJ="${1:-$PROJ}"
if [ -z "$PROJ" ]; then
    echo "Error: PROJ is empty in env" >&2
    exit 1
fi

VENV_PATH="${PROJ}/.venv"
if [ ! -d "$PROJ" ]; then
    mkdir -p "$PROJ"
    VENV_PATH="${PROJ}/.venv"
    cp "$REQ" "$PROJ/"
else
    echo "Project directory '$PROJ' already exists — skipping setup."
fi

python3 -m venv "${VENV_PATH}"

# Activate it (Linux/macOS)
source ${VENV_PATH}/bin/activate

# Upgrade pip
pip install --upgrade pip

# Install requirements
pip install -r ${PROJ}/requirements.txt

echo "✅ Virtual environment set up in $PROJ"
