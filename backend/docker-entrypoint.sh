#!/bin/sh
set -e

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
