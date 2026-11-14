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
  - `parsers/reserve-fleet.parser.ts` — car id, name, brand-and-model text, and fuel from a saved `/calendar/cars` page
  - `match-car-brand.ts` — longest brand prefix, then explicit fleet spellings, then the model prefix (`mercedes` maps to `mercedes-benz`)
- `app/storage/play-connector/` — `PlayConnector` table (encrypted secrets at rest)
- `app/actions/play-connector/` — link, disconnect, status, session cookie orchestration (including admin mode), create car
- `app/actions/play-infosession/` — list owner infosessions (type contains `eigenaar`) and unenroll

Play backend datetimes have no timezone. They are Belgium local time (`Europe/Brussels`, CET UTC+1 / CEST UTC+2) and are converted to UTC
instants when parsed.

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

### Degapp brand mapping

Save `https://degapp.be/calendar/cars` while logged in, then run:

```bash
pnpm map:degapp-car-brands -- /path/to/Reserveer.html
```

The page lists the reservable fleet. Each car row has the Degapp car name and one free-text brand and model, such as `Opel Zafira`, plus a fuel
label. Bicycles on the same page are counted and left out. The script matches the leading words to a catalog brand, then matches the remaining
words to a catalog type of that brand and fuel. `Benzine` is gasoline, `Elektrisch` is electric, and `Plugin Hybride` is plugin-hybrid. Extra
words still match: `Golf 1.6` matches `GOLF`, while `Golf Variant` matches `GOLF Variant`. `ID3` matches `ID.3`. It prints a JSON report and
writes nothing to Play or to this database.

A match folds case, accents, spaces, and hyphens. When that prefix misses, the script rewrites a few fleet spellings and matches again: `Toyoya`
to Toyota, `Peugot` to Peugeot, `Huyndai` to Hyundai, `Mercedes` to Mercedes-Benz, `FIAT500` to Fiat 500, and `zoe` to Renault ZOE.
`Mercedes C220` then matches with model `C220`. An abbreviation such as `VW` stays unmatched. Two catalog types with the same name and fuel
count as one match.

Each car has a brand result and a type result. A type is `confident`, `suggested` when the brand matches and no catalog type does, or
`conflict`. Unmatched brand-and-model strings are listed once. Suggested types are listed once per brand, fuel, and model text. A confident
match on an inactive catalog row includes `isActive: false`.

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
