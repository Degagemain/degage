---
title: Local development
roles:
  - technical
---

# Local development

Several checkouts of this repository (worktrees, clones, branches) can run at the same time. They share one Postgres container, and each
checkout gets its own database inside it.

## Shared stack

[`docker-compose.yml`](../../docker-compose.yml) pins `name: neurotic-web`, so `docker compose up -d` from any checkout attaches to the same
project, container, and volume. `pnpm db:start` is idempotent. `pnpm dev` already runs it via `predev`. When `DEV_ACCOUNT_EMAIL` is set,
`predev` also checks whether that user exists and prints a login hint or a reminder to run `pnpm db:seed-dev-account`.

| Service    | Host port | Purpose                                                         |
| ---------- | --------- | --------------------------------------------------------------- |
| `postgres` | `5432`    | pgvector-enabled Postgres, all databases                        |
| `dbgate`   | `8081`    | Web SQL client at `http://localhost:8081`, lists every database |

DBGate is not pinned to a single database, so one instance browses every checkout's data.

## One database per checkout

The main checkout keeps database `app`. A worktree uses `app_<branch>`: the current branch, lowercased, with each non-alphanumeric run turned
into `_`. `feat/my-branch` becomes `app_feat_my_branch`. The repository name is removed from that slug. Both URLs in `.env` use it:

```bash
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/app_feat_my_branch?schema=public
DATABASE_URL_UNPOOLED=postgresql://postgres:postgres@localhost:5432/app_feat_my_branch?schema=public
```

Create a sibling checkout with `pnpm worktree:new -- feat/my-branch`. That creates the branch when it does not exist (or checks out an existing
local or `origin` branch), adds a git worktree one directory above the repo (slashes in the branch name become hyphens in the folder name:
`<repository>-feat-my-branch`), and runs `pnpm i`. The `.env` is copied from the checkout you run the command in, so run it somewhere that has
one. If it does not, you get a warning and the database steps are skipped. Otherwise it copies `.env`, runs `pnpm worktree:init`, then
`db:start`, migrate, seed, and the dev-account seed.

`pnpm worktree:init` rewrites the current checkout's `.env` only. It sets `app_<branch>` and `PORT=3000 + (worktree count - 1)`. On a detached
`HEAD`, the name comes from the directory, with a leading `<repository>-` removed. `pnpm db:migrate` creates the database when it does not
exist, and an existing migration installs the `vector` extension.

Cursor worktrees copy `.env` from the main checkout and call `pnpm worktree:init` after `pnpm i`. Finish that checkout with:

```bash
pnpm db:start && pnpm db:migrate && pnpm db:seed && pnpm db:seed-dev-account
```

## One port per checkout

`PORT` binds the dev server. `BETTER_AUTH_URL` is the public base url Better Auth uses for cookies and OAuth callbacks. They must agree, so
`.env` derives one from the other:

```bash
PORT=3000
BETTER_AUTH_URL=http://localhost:${PORT}
```

`pnpm dev` runs through `dotenv-cli` so `PORT` is set before Next binds its port. Without that, Next would fall back to the next free port and
Better Auth would keep advertising the old one.

These host ports stay reserved:

| Port    | Use                 |
| ------- | ------------------- |
| `5432`  | Postgres            |
| `8081`  | DBGate              |
| `3100+` | Playwright workers  |
| `3199`  | Play connector mock |

## Resetting

| Command         | Scope                                                                          |
| --------------- | ------------------------------------------------------------------------------ |
| `pnpm db:reset` | Drops and recreates only the database in `DATABASE_URL`, migrates, and reseeds |
| `pnpm db:nuke`  | Removes the Docker volume, destroying every checkout's database                |

Use `db:nuke` only when you intend to start the whole machine over. Afterwards each checkout needs `pnpm db:migrate`, `pnpm db:seed`, and
`pnpm db:seed-dev-account` again.
