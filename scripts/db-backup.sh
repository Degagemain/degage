#!/usr/bin/env bash
set -euo pipefail

if ! command -v docker >/dev/null 2>&1; then
  echo "Docker is required but was not found in PATH" >&2
  exit 1
fi

if [[ "${1:-}" == "--" ]]; then
  shift
fi

database_url="${1:-}"

if [[ -z "$database_url" ]]; then
  echo "Usage: pnpm db:backup -- <DATABASE_URL>" >&2
  exit 1
fi

mkdir -p backups
timestamp="$(date +%Y%m%d-%H%M%S)"
output="backups/backup-${timestamp}.sql"

docker run --rm postgres:16 pg_dump "$database_url" >"$output"
echo "$output"
