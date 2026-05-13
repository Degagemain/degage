# Agents

## Cursor Cloud specific instructions

### Services

| Service | How to start | Port |
|---------|-------------|------|
| PostgreSQL (pgvector) | `docker compose up -d` (or via `pnpm db:start`) | 5432 |
| Next.js dev server | `pnpm dev` (includes `predev` hook that starts Docker services) | 3000 |

### Running the app

- `pnpm dev` starts both Docker (PostgreSQL + DbGate) and the Next.js dev server with Turbopack.
- The dev account (`dev@degage.be` / `password`) is an admin user. Seed it with `pnpm db:seed-dev-account`.

### Docker in Cloud Agent VMs

Docker requires explicit startup of `dockerd` with `fuse-overlayfs` storage driver and `iptables-legacy`. After installing Docker, run:

```bash
sudo dockerd --storage-driver=fuse-overlayfs &>/dev/null &
sleep 3
sudo chmod 666 /var/run/docker.sock
```

### Key commands

See `package.json` scripts. Notable:

- **Lint/format**: `pnpm run lint:fix && pnpm run format:fix` (also `pnpm run fix`)
- **Tests**: `pnpm vitest --no-watch` (do NOT use `pnpm test` — it enters watch mode)
- **DB reset**: `pnpm db:reset` (destroys volumes, restarts containers, re-migrates and seeds)
- **DB migrate**: `pnpm db:migrate`
- **DB seed**: `pnpm db:seed` (reference data) then `pnpm db:seed-dev-account` (admin account)

### Gotchas

- The `pnpm install` warning about "Ignored build scripts" for `@parcel/watcher`, `@swc/core`, `better-sqlite3`, `core-js`, `protobufjs` is expected and safe to ignore. Do NOT run `pnpm approve-builds` (it is interactive).
- The `predev` script runs `docker compose up -d` automatically before `pnpm dev`. If Docker is not yet started, `pnpm dev` will fail — start dockerd first.
- Prisma client is generated automatically via the `postinstall` hook.
- The pre-commit hook runs `pnpm run lint:fix`, `pnpm run format:fix`, and `pnpm vitest --no-watch`. Ensure tests pass before committing.
