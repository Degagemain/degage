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
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

## Layers

- `app/play-connector/` — HTTP client, login, cookie parsing, HTML parsers (no database)
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

| Method   | Path                     | Description                                                            |
| -------- | ------------------------ | ---------------------------------------------------------------------- |
| `GET`    | `/api/play-connector`    | Current user's connector status: `missing`, `success`, or `failing`    |
| `PUT`    | `/api/play-connector`    | Link credentials (`email`, `password`); validates login before storing |
| `DELETE` | `/api/play-connector`    | Remove linked credentials                                              |
| `GET`    | `/api/play-infosessions` | List parsed infosessions from the Play backend                         |

## UI

Account settings → **Play connector** tab (`/app/account/settings`).
