#!/usr/bin/env bash
set -euo pipefail

if [[ ! -f .env ]]; then
  echo "Missing .env in ${PWD}; copy one here first" >&2
  exit 1
fi

sanitize() {
  printf '%s' "$1" | tr '[:upper:]' '[:lower:]' | tr -c 'a-z0-9' '_' | sed 's/^_*//; s/_*$//; s/__*/_/g'
}

main_worktree="$(git worktree list --porcelain | awk '/^worktree / { print substr($0, 10); exit }')"
repo="$(basename "$main_worktree")"
branch="$(git rev-parse --abbrev-ref HEAD)"

if [[ "$branch" == "HEAD" ]]; then
  folder="$(basename "$PWD")"
  prefix="${repo}-"
  if [[ "$folder" == "$prefix"* ]]; then
    branch="${folder#"$prefix"}"
  else
    branch="$folder"
  fi
fi

slug="$(sanitize "$branch")"
repo_slug="$(sanitize "$repo")"

if [[ -n "$repo_slug" ]]; then
  slug="${slug//"$repo_slug"/}"
  slug="$(sanitize "$slug")"
fi

if [[ -z "$slug" ]]; then
  echo "Could not derive a database name from ${branch}" >&2
  exit 1
fi

db="app_${slug}"
if ((${#db} > 63)); then
  db="$(sanitize "${db:0:63}")"
fi

if [[ -n "$repo_slug" && "$db" == *"$repo_slug"* ]]; then
  echo "Refusing database name ${db}; it contains the repository name" >&2
  exit 1
fi

port=$((3000 + $(git worktree list | wc -l) - 1))

if ! grep -q '^PORT=' .env; then
  echo "PORT=${port}" >>.env
fi

perl -pi -e "s#(:5432/)[^?\\s]+#\\1${db}#g; s#^PORT=.*#PORT=${port}#; s#^BETTER_AUTH_URL=http://localhost:\\d+#BETTER_AUTH_URL=http://localhost:${port}#" .env
echo "Worktree env: database ${db} on port ${port}"
