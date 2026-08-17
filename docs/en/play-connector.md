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
  - `admin-mode.ts` — enable admin mode via `GET /admin/set` and merge the upgraded session cookie
  - `cars.model.ts` — optional create-car input schema and Play dropdown enums (`fuel`, `purchaseDate`)
  - `cars.ts` — car name availability (`/cars/page`, admin mode) and create car (`POST /api/cars/new`, regular session)
  - `parsers/infosession-table.parser.ts` — upcoming infosession table rows from `/infosession` HTML
  - `parsers/infosession-chosen.parser.ts` — enrolled "Gekozen infosessie" panel from `/infosession` HTML
  - `parsers/profile-page.parser.ts` — name (first/last), Dégage ID, Verblijfsadres (street/house number/zip/city), GSM from `/profile` HTML
  - `parsers/cars-page.parser.ts` — car names from `/cars/page` `/cars/view` links (exact match for availability)
- `app/storage/play-connector/` — `PlayConnector` table (encrypted secrets at rest)
- `app/actions/play-connector/` — link, disconnect, status, session cookie orchestration (including admin mode), create car
- `app/actions/play-infosession/` — list owner infosessions (type contains `eigenaar`) and unenroll

Play infosession `scheduledAt` strings from the legacy backend have no timezone. They are Belgium local time (`Europe/Brussels`, CET UTC+1 /
CEST UTC+2) and are converted to UTC instants when parsed so onboarding shows the same wall-clock time as Play.

### Create car

`createPlayCar(userId, input)` (regular session via `getPlaySessionCookie`) POSTs to Play `POST /api/cars/new` and returns `{ id }` from the
JSON response.

All input fields are optional. Dropdown enums (Play create form):

| Field          | Values                                                                 |
| -------------- | ---------------------------------------------------------------------- |
| `fuel`         | `ELECTRIC`, `DIESEL`, `PETROL`, `HYBRID`, `PLUGINHYBRID`, `LPG`, `CNG` |
| `purchaseDate` | `STILLTOBEPURCHASED`, `LESSTHAN`, `OVERTHAN`                           |

Unset fields are filled with Play defaults (e.g. `fuel: ELECTRIC`, `purchaseDate: STILLTOBEPURCHASED`, `status: REGISTERED`, reservation
defaults `INFINITE` / `THREEMONTHS` / `NONE`).

## Session cookie flow

1. `getPlaySessionCookie(userId)` reads the user's connector row.
2. If a cached cookie exists and `sessionExpiresAt` is in the future, decrypt and return it.
3. Otherwise decrypt the stored password, log in to Play (up to 2 attempts, ~2s apart).
4. On success, encrypt and persist the new cookie and expiry; on failure, set `credentialsInvalid` and a short `loginBlockedUntil` backoff
   (~5s).

### Admin mode session

1. `getPlayAdminModeSessionCookie(userId)` first obtains a normal session via `getPlaySessionCookie`.
2. It calls `GET /admin/set` (no redirect follow) and merges the returned `PLAY_SESSION` into an in-memory cookie header (not persisted).
3. It loads `/` and requires an `a[href="/admin/clear"]` link. If enable fails or that link is missing, it throws `unauthorized`.
4. Admin-mode-only Play actions (e.g. car name availability) should use this helper instead of `getPlaySessionCookie`.

Car onboarding car-name availability uses admin mode via the oldest Code1 admin user (temporary).

`// TODO: replace oldest-admin lookup with a dedicated admin-mode play connector account.`

## API

| Method   | Path                                       | Description                                                                                                                                                 |
| -------- | ------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `GET`    | `/api/play-connector`                      | Current user's connector status: `missing`, `success`, or `failing`                                                                                         |
| `PUT`    | `/api/play-connector`                      | Link credentials (`email`, `password`); validates login before storing                                                                                      |
| `DELETE` | `/api/play-connector`                      | Remove linked credentials                                                                                                                                   |
| `GET`    | `/api/play-infosessions`                   | List parsed owner infosessions from the Play backend (upcoming table filtered to type containing `eigenaar` + chosen session when enrolled)                 |
| `PUT`    | `/api/play-infosessions/unenroll`          | Unenroll from the current Play infosession (legacy platform only; does not update car onboarding)                                                           |
| `PUT`    | `/api/car-onboardings/{id}/play-connector` | Link credentials during car onboarding; on success fetches Play profile and pre-fills empty `street`, `town` (by zip + city), and `phone` on the onboarding |

## UI

Account settings → **Play connector** tab (`/app/account/settings`) is where users connect and disconnect. Car onboarding → **Play connector**
step uses the onboarding-specific connect endpoint above and does not offer disconnect (use account settings).
