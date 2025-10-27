#!/bin/bash

# Activates the virtual environment (Unix/macOS)
if [ -d ".venv" ]; then
  source .venv/bin/activate
  echo "✅ Virtual environment activated."
else
  echo "❌ .venv directory not found. Run create_venv.sh first."
fi