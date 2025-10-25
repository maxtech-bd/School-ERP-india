#!/bin/bash
set -e

echo "Starting School ERP Production Server..."

# Start backend on port 5000 (serves frontend from frontend/build)
cd backend
exec uvicorn server:app --host 0.0.0.0 --port 5000 --workers 2
