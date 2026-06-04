#!/bin/sh
set -e

# Generate .env from .env.example on first run so the app always has a baseline
# config. Values injected via docker-compose `environment` still take precedence
# (dotenv does not override existing process env vars).
if [ ! -f .env ] && [ -f .env.example ]; then
  echo "Generating backend/.env from .env.example..."
  cp .env.example .env
fi

host="${DB_HOST:-mysql}"
port="${DB_PORT:-3306}"

echo "Waiting for MySQL at ${host}:${port}..."
while ! nc -z "$host" "$port"; do
  sleep 1
done

echo "Running Sequelize migrations (env: docker)..."
npx sequelize-cli db:migrate --config config/config.cjs --env docker

echo "Starting API..."
exec "$@"
