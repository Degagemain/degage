#!/usr/bin/env bash
set -euo pipefail

if [[ "${1:-}" == "--" ]]; then
  shift
fi

branch="${1:-}"

if [[ -z "$branch" ]]; then
  echo "Usage: pnpm worktree:new -- <branch>" >&2
  exit 1
fi

if ! git check-ref-format "refs/heads/${branch}"; then
  echo "Invalid branch name: ${branch}" >&2
  exit 1
fi

root="$(git rev-parse --show-toplevel)"
parent="$(dirname "$root")"
repo="$(basename "$root")"
folder="${repo}-$(printf '%s' "$branch" | tr '/' '-')"
path="${parent}/${folder}"

if [[ -e "$path" ]]; then
  echo "Path already exists: ${path}" >&2
  exit 1
fi

if git show-ref --verify --quiet "refs/heads/${branch}"; then
  git worktree add "$path" "$branch"
elif git show-ref --verify --quiet "refs/remotes/origin/${branch}"; then
  git worktree add --track -b "$branch" "$path" "origin/${branch}"
else
  git worktree add -b "$branch" "$path"
fi

cd "$path"
pnpm i

source_env="${root}/.env"
if [[ ! -f "$source_env" ]]; then
  echo "Warning: no .env at ${source_env}; skipped copy, env init, and database setup" >&2
else
  cp "$source_env" .env
  pnpm worktree:init
  pnpm db:start
  pnpm db:migrate
  pnpm db:seed
  pnpm db:seed-dev-account
fi

echo "Worktree ready: ${path}"
