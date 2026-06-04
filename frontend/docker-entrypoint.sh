#!/bin/sh
set -e

cd /app

if [ ! -d node_modules/react-day-picker ]; then
  echo "Installing frontend dependencies (package lock changed or stale image)..."
  npm ci --workspace=@househunt/frontend --include-workspace-root
fi

cd /app/frontend

# Generate .env from .env.example on first run so Vite has a baseline config.
# docker-compose `environment` values still win (they're real process env vars).
if [ ! -f .env ] && [ -f .env.example ]; then
  echo "Generating frontend/.env from .env.example..."
  cp .env.example .env
fi

exec "$@"
