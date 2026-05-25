#!/usr/bin/env bash
set -euo pipefail

if ! command -v docker >/dev/null 2>&1; then
  echo "Docker is required but was not found in PATH" >&2
  exit 1
fi

if [[ "${1:-}" == "--" ]]; then
  shift
fi

master_database_url="${1:-}"
new_database_name="${2:-}"
backup_file="${3:-}"

if [[ -z "$master_database_url" || -z "$new_database_name" || -z "$backup_file" ]]; then
  echo "Usage: pnpm db:restore -- <MASTER_DATABASE_URL> <NEW_DB_NAME> <BACKUP_FILE>" >&2
  exit 1
fi

if [[ ! "$new_database_name" =~ ^[a-z][a-z0-9_]*$ ]]; then
  echo "NEW_DB_NAME must start with a lowercase letter and contain only lowercase letters, digits, and underscores" >&2
  exit 1
fi

if [[ ! -f "$backup_file" ]]; then
  echo "Backup file not found: ${backup_file}" >&2
  exit 1
fi

database_url_for_name() {
  local master_url="$1"
  local db_name="$2"

  if [[ "$master_url" =~ ^((postgresql|postgres)://[^/]+/)([^/?]+)(.*)$ ]]; then
    echo "${BASH_REMATCH[1]}${db_name}${BASH_REMATCH[4]}"
    return 0
  fi

  echo "Unrecognized database URL format; expected postgresql://host:port/database" >&2
  return 1
}

database_exists() {
  docker run --rm postgres:16 psql "$master_database_url" -tAc \
    "SELECT 1 FROM pg_database WHERE datname = '${new_database_name}'"
}

if [[ -n "$(database_exists)" ]]; then
  echo "Database '${new_database_name}' already exists" >&2
  exit 1
fi

docker run --rm postgres:16 psql "$master_database_url" -v ON_ERROR_STOP=1 -q \
  -c "CREATE DATABASE ${new_database_name}" >/dev/null

target_database_url="$(database_url_for_name "$master_database_url" "$new_database_name")"

backup_dir="$(cd "$(dirname "$backup_file")" && pwd)"
backup_name="$(basename "$backup_file")"

docker run --rm -v "${backup_dir}:/backup:ro" postgres:16 psql "$target_database_url" -v ON_ERROR_STOP=1 -q \
  -f "/backup/${backup_name}" >/dev/null

echo "$target_database_url"
