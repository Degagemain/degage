---
roles:
  - technical
---

# Play connector

The play connector lets an authenticated user link legacy Play backend credentials. The app stores encrypted credentials and a cached session
cookie, then reuses them for server-side requests (e.g. listing infosessions).

## Environment variables

| Variable                        | Required | Description                                                                        |
| ------------------------------- | -------- | ---------------------------------------------------------------------------------- |
| `PLAY_CONNECTOR_ENCRYPTION_KEY` | Yes      | Base64-encoded 32-byte AES key for encrypting stored passwords and session cookies |
| `PLAY_CONNECTOR_BASE_URL`       | No       | Play backend origin (default: `https://degapp.be`)                                 |

Generate a key:

```bash
pnpm play-connector:generate-key
```

Copy the output into `PLAY_CONNECTOR_ENCRYPTION_KEY` in `.env`.

## Local and E2E mock backend

For local development or E2E without hitting the real Play backend, use the mock server in [`e2e/play-mock/`](../../e2e/play-mock/).

```bash
pnpm play-connector:mock
```

Set `PLAY_CONNECTOR_BASE_URL=...` (default localhost 3199). Mock login accepts `PLAY_MOCK_EMAIL` / `PLAY_MOCK_PASSWORD`, or falls back to
`E2E_USER_EMAIL` / `E2E_PASSWORD` from [`e2e/.env.e2e`](../../e2e/.env.e2e).

During `pnpm e2e`, global setup starts the mock automatically. You can also run `pnpm play-connector:mock` manually when testing connector flows
against `pnpm dev`.

Mock endpoints:

| Method | Path                    | Description                                                      |
| ------ | ----------------------- | ---------------------------------------------------------------- |
| `POST` | `/login`                | Form login; returns session cookies on success                   |
| `GET`  | `/infosession`          | HTML table with sample infosessions (requires session cookie)    |
| `GET`  | `/infosession/enroll`   | Enroll in session (`?id=` enroll id); requires session cookie    |
| `GET`  | `/infosession/unenroll` | Unenroll from current session; requires session cookie           |
| `GET`  | `/profile`              | HTML profile page with sample user data; requires session cookie |
| `GET`  | `/`                     | Health check                                                     |

## Layers

- `app/play-connector/` — HTTP client, login, cookie parsing, HTML parsers (no database)
  - `parsers/infosession-table.parser.ts` — upcoming infosession table rows from `/infosession` HTML
  - `parsers/infosession-chosen.parser.ts` — enrolled "Gekozen infosessie" panel from `/infosession` HTML
  - `parsers/profile-page.parser.ts` — name (first/last), Dégage ID, Verblijfsadres (street/zip/city), GSM from `/profile` HTML
- `app/storage/play-connector/` — `PlayConnector` table (encrypted secrets at rest)
- `app/actions/play-connector/` — link, disconnect, status, session cookie orchestration
- `app/actions/play-infosession/` — first consumer use case

## Session cookie flow

1. `getPlaySessionCookie(userId)` reads the user's connector row.
2. If a cached cookie exists and `sessionExpiresAt` is in the future, decrypt and return it.
3. Otherwise decrypt the stored password, log in to Play (up to 2 attempts, ~2s apart).
4. On success, encrypt and persist the new cookie and expiry; on failure, set `credentialsInvalid` and a short `loginBlockedUntil` backoff
   (~5s).

## API

| Method   | Path                                       | Description                                                                                                                                                 |
| -------- | ------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `GET`    | `/api/play-connector`                      | Current user's connector status: `missing`, `success`, or `failing`                                                                                         |
| `PUT`    | `/api/play-connector`                      | Link credentials (`email`, `password`); validates login before storing                                                                                      |
| `DELETE` | `/api/play-connector`                      | Remove linked credentials                                                                                                                                   |
| `GET`    | `/api/play-infosessions`                   | List parsed infosessions from the Play backend (upcoming table + chosen session when enrolled)                                                              |
| `PUT`    | `/api/play-infosessions/unenroll`          | Unenroll from the current Play infosession (legacy platform only; does not update car onboarding)                                                           |
| `PUT`    | `/api/car-onboardings/{id}/play-connector` | Link credentials during car onboarding; on success fetches Play profile and pre-fills empty `street`, `town` (by zip + city), and `phone` on the onboarding |

## UI

Account settings → **Play connector** tab (`/app/account/settings`). Car onboarding → **Play connector** step uses the onboarding-specific
connect endpoint above.
