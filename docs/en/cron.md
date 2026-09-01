---
title: Cron jobs
roles:
  - technical
---

# Cron jobs

Scheduled jobs run on [Vercel Cron](https://vercel.com/docs/cron-jobs). Paths and schedules are declared in `vercel.json`. Each request must
present `Authorization: Bearer {CRON_SECRET}`; Vercel sends this header automatically when `CRON_SECRET` is set in the project environment.

| Variable      | Description                                                                                      |
| ------------- | ------------------------------------------------------------------------------------------------ |
| `CRON_SECRET` | Shared secret that authorizes cron HTTP calls. Required in production; requests fail without it. |

## Production: set `CRON_SECRET` on Vercel

The cron endpoint is public unless this secret is set. Vercel does not create it for you.

1. Generate a random string of at least 16 characters (for example `openssl rand -hex 32`, or a password manager).
2. In the Vercel dashboard, open the production project → **Settings** → **Environment Variables**.
3. Add `CRON_SECRET` with that value. Scope it to **Production** (and Preview if you want to call the route there yourself). Do not include a
   trailing newline.
4. Redeploy production so the new variable is available to the running app.

After that, Vercel Cron sends `Authorization: Bearer <CRON_SECRET>` on each scheduled `GET`. The handler rejects any request without that
header. Cron jobs only run on **Production** deployments.

Confirm the job under the project’s **Settings** → **Cron Jobs**. Runtime output is in **Logs**, filtered to
`/api/cron/car-onboarding-preparation-nudge`. See [Managing Cron Jobs](https://vercel.com/docs/cron-jobs/manage-cron-jobs).

## Car onboarding preparation reminder

|                   |                                                                                |
| ----------------- | ------------------------------------------------------------------------------ |
| Path              | `GET /api/cron/car-onboarding-preparation-nudge`                               |
| Schedule          | Daily at 07:00 UTC (`0 7 * * *`)                                               |
| Template          | `car-onboarding-preparation-nudge-email` (Resend design alias `button-email`)  |
| Public button URL | `{BETTER_AUTH_URL}/app/car-onboardings/{id}` via runtime variable `BUTTON_URL` |

The job sends a reminder when preparation is still **Open**, the owner has not confirmed, and no reminder was sent in the last 72 hours. After a
successful send it stores `lastPreparationNudgeEmail`. Admins can trigger the same action from an onboarding detail screen.
