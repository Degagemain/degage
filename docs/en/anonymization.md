---
title: Anonymization
roles:
  - technical
---

# Anonymization

`pnpm db:anonymize` replaces personal data in the database the process is connected to, then creates the dev admin. Use it on a preview copy of
production. It does not delete files in document storage.

The command runs only when `VERCEL_ENV` is `preview`. Any other value, including an unset variable, exits before SQL unless `--force` is passed.
`NODE_ENV` is ignored, because Vercel sets it to `production` for preview builds too.

```bash
pnpm db:anonymize -- --force
```

The connection is `DATABASE_URL_UNPOOLED` when that is set, otherwise `DATABASE_URL`. Statements run in one transaction. A failed run leaves the
database unchanged.

## What changes

User email becomes `delivered+{id}@resend.dev` in lowercase, the same Resend test recipient as the dev admin (`delivered+dev@resend.dev`).
Resend accepts that address and does not deliver mail to a real inbox. The display name becomes two words, such as `Calm Otter`, chosen from the
row id so a second run writes the same name. The profile image is cleared. Role, ban status, and language stay. The row whose email is
`DEV_ACCOUNT_EMAIL` keeps that email, name, and image.

Sessions, linked login providers, verification codes, and signing keys are removed. Every user can sign in with the password `password`,
including people who previously signed in only with Google or GitHub. Their email is marked verified, which sign-in requires. Saved OAuth client
secrets and contact emails are cleared. Other client settings stay.

Play connector rows stay. The email becomes `delivered+play-{id}@resend.dev`, the stored password and session are replaced, and further Play
login is blocked.

Car onboardings keep their town, car, insurer, prices, mileage, and statuses. The car name is replaced with two car words joined without a
space, such as `ZippyHatch`, so it still fits the car name rules. Address, house number, phone, license plate, vehicle identification number,
free-text messages, and Play ids are cleared.

The email stored on a simulation is cleared. Chat conversations and messages stay. Document rows and the links that point at them stay, so
onboarding statuses that depend on those links do not change.

## Dev admin

After the transaction commits, the command creates `DEV_ACCOUNT_EMAIL` with password `password` and the admin role. That is the same seed as
`pnpm db:seed-dev-account`. Email verification is skipped. If `DEV_ACCOUNT_EMAIL` is unset, anonymization still finishes and the command prints
that no admin was created. If the admin already exists, the seed does nothing. Their password is `password`, the same as every other user.

Set `DEV_ACCOUNT_EMAIL` on the Preview environment.

## Preview deploy

Do not change the default build. Call the command from the preview build, where `VERCEL_ENV` is `preview` and `--force` is not needed:

```bash
if [ "$VERCEL_ENV" = "preview" ]; then pnpm db:anonymize; fi && pnpm build
```

If the command is invoked with any other `VERCEL_ENV` and without `--force`, it exits 1 and writes nothing.

Give the preview deployment its own `DATABASE_URL` and its own `GCP_BUCKET_NAME`. Document rows are kept. A preview pointed at the production
bucket can still download those files. See [Object storage](object-storage.md).
