#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
echo "Using repo root: $ROOT"

echo "Starting backend in background..."
cd "$ROOT"
node index.js &
PID=$!
echo "backend pid=$PID"
sleep 6

echo "Running health check..."
curl -sf http://localhost:5000/ || { echo "Health check failed"; kill $PID || true; exit 1; }

# Register + login smoke
curl -sf -X POST http://localhost:5000/api/auth/register \
  -H 'Content-Type: application/json' \
  -d '{"name":"Smoke","email":"smoke@test.local","password":"smoke123"}' > /dev/null 2>&1 || true

TOKEN=$(curl -sf -X POST http://localhost:5000/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"smoke@test.local","password":"smoke123"}' | node -e "process.stdin.on('data',d=>{console.log(JSON.parse(d).token)})")

curl -sf http://localhost:5000/api/workflows -H "Authorization: Bearer $TOKEN" > /dev/null
echo "Smoke test PASSED"

echo "Stopping backend pid=$PID"
kill $PID || true
echo "Done"
