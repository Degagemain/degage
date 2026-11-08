---
title: Documenso
roles:
  - technical
---

# Documenso

Documenso is the e-sign provider for contract templates. The app creates template envelopes from uploaded PDFs, starts signing by using a
template for a contract user, and stores the completed PDF in GCS when Documenso reports completion.

## Environment

| Variable                   | Purpose                                                 |
| -------------------------- | ------------------------------------------------------- |
| `DOCUMENSO_API_URL`        | API base including `/api/v2` (required)                 |
| `DOCUMENSO_API_KEY`        | API authentication (required)                           |
| `DOCUMENSO_APP_URL`        | Web UI origin for template editor deep links (required) |
| `DOCUMENSO_WEBHOOK_SECRET` | Optional; verified via `X-Documenso-Secret`             |

Client code lives in `app/integrations/documenso.ts` (thin `fetch` against envelope endpoints).

### Staging API key

1. Sign in on the Documenso staging app (staging accounts are separate from production).
2. Open the team → **Settings → API Tokens** (or `/t/<team-url>/settings/tokens`).
3. Create a token, copy the `api_…` value once, and set `DOCUMENSO_API_KEY` in `.env`.
4. Point `DOCUMENSO_API_URL` and `DOCUMENSO_APP_URL` at that same staging environment.

## Staging plan and test card

Staging free plans have a small document quota and fair-use API limits. Exhausted quotas return **429** (`TOO_MANY_REQUESTS` / “fair use
limits”) even on the first `envelope.create` — every authenticated API call counts toward the org quota.

Upgrade the staging team to a paid plan for development. Staging uses Stripe test mode; use this card (no real charge):

| Field  | Value                 |
| ------ | --------------------- |
| Number | `4242 4242 4242 4242` |
| Expiry | Any future date       |
| CVV    | `123`                 |

See [Documenso demo environment](https://docs.documenso.com/docs/developers/demo-environment).

## Webhook

Configure Documenso to `POST` to `/api/webhooks/documenso`. Subscribe at least to `DOCUMENT_COMPLETED`. On that event the app downloads the
signed PDF, stores a `Document` of type `contract`, and sets the contract status to `signed`.

### Local testing with ngrok

Documenso cannot reach `localhost`. Tunnel the Next app and register the public URL:

1. Run the app (`pnpm dev`, usually `http://localhost:3000`).
2. Start a tunnel: `ngrok http 3000` and copy the HTTPS origin (e.g. `https://abc123.ngrok-free.app`).
3. In Documenso staging → team **Settings → Webhooks**, set:
   - **URL:** `https://<ngrok-host>/api/webhooks/documenso`
   - **Events:** at least `DOCUMENT_COMPLETED`
   - **Secret (optional):** any shared string
4. If you set a secret, put the same value in `DOCUMENSO_WEBHOOK_SECRET` and restart the app. If the env var is empty, the route skips secret
   checks.

Free ngrok assigns a new hostname each start; update the Documenso webhook URL when it changes.

## Resend

For a contract already in `sent` status, `POST /api/contracts/:id/resend` (and the car-onboarding contract tab) calls Documenso
`/envelope/redistribute` for unsigned signer/approver recipients so the signing email can be sent again.

## Recipient model

Each Documenso template always includes an Owner `SIGNER` with placeholder email `owner@contract.placeholder` so admins can place signature
fields. An optional Degage admin `SIGNER` and CC viewers come from the contract type defaults. When a contract is sent, the Owner slot is mapped
to the contract user.

Updating a contract type’s default signee or default viewers syncs those recipients onto the existing Documenso template envelope (create /
update / delete), so signature fields can be placed for the current people. If the type has no Documenso template yet, only the local record is
updated.
