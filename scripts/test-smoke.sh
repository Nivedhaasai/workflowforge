#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
echo "Using repo root: $ROOT"

echo "Killing existing node processes (may require sudo)..."
pkill -f node || true
sleep 1

echo "Starting backend in background..."
cd "$ROOT"
node index.js &
PID=$!
echo "backend pid=$PID"
sleep 4

echo "Running smoke verification..."
node test-step6-verify.js || true

echo "Stopping backend pid=$PID"
kill $PID || true

echo "Done"
