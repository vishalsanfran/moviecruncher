#!/bin/bash

# Activate virtual environment
source .venv/bin/activate

# Start the FastAPI server
uvicorn film_report_api:app --reload --host 0.0.0.0 --port 8000