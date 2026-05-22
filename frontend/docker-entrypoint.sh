#!/bin/sh
set -e

cd /app

if [ ! -d node_modules/react-day-picker ]; then
  echo "Installing frontend dependencies (package lock changed or stale image)..."
  npm ci --workspace=@househunt/frontend --include-workspace-root
fi

cd /app/frontend
exec "$@"
