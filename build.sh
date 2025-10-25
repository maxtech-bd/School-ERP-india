#!/bin/bash
set -e

echo "========================================="
echo "BACKEND-ONLY DEPLOYMENT"
echo "========================================="

echo "==> Installing Python backend dependencies..."
pip install --upgrade pip --no-cache-dir
pip install -r backend/requirements-minimal.txt --no-cache-dir
echo "   ✓ Backend ready"

echo "========================================="
echo "BUILD COMPLETE - Backend API Only"
echo "========================================="
