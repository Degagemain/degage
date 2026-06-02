---
title: PostHog analytics
roles:
  - technical
---

# PostHog analytics

Product analytics for the onboarding app via [PostHog EU](https://eu.posthog.com).

## Setup

| Variable                            | Purpose                                           |
| ----------------------------------- | ------------------------------------------------- |
| `NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN` | Project API key (`phc_…`)                         |
| `NEXT_PUBLIC_POSTHOG_HOST`          | Ingest host (default `https://eu.i.posthog.com`)  |
| `POSTHOG_API_KEY`                   | Personal API key for source maps on Vercel builds |
| `POSTHOG_PROJECT_ID`                | Numeric project ID for source maps                |

Client init: [`instrumentation-client.ts`](../../instrumentation-client.ts) — autocapture, pageviews, exceptions, session replay with masked
inputs.

**Internal users** (team `@degage.be` accounts, admin role, admin zone) are tracked like everyone else — no opt-out, route exclusions, or
test-account filtering in app code. Use the `role` person property to segment admin vs user traffic in dashboards when needed.

Helpers:

- [`app/app/lib/posthog.ts`](../../app/app/lib/posthog.ts) — `capture`, `identifyPostHogUser`, `setPostHogPersonProperties`, `resetPostHog`
- [`app/app/lib/posthog-events.ts`](../../app/app/lib/posthog-events.ts) — typed onboarding events

Server events: [`app/integrations/posthog.ts`](../../app/integrations/posthog.ts) — `captureEvent('simulation', …)` from the simulation engine.

## Custom events

### Acquisition & login path

| Event                         | Properties                              | Trigger                  |
| ----------------------------- | --------------------------------------- | ------------------------ |
| `landing_cta_clicked`         | `cta`: hero \| eligibility \| footer    | Landing simulation CTA   |
| `login_dialog_opened`         | `surface`: landing \| simulation \| faq | Public header “Inloggen” |
| `login_dialog_option_clicked` | `option`: degapp \| onboarding          | Login dialog choice      |

### Auth

| Event                            | Properties                           | Trigger                      |
| -------------------------------- | ------------------------------------ | ---------------------------- |
| `auth_sign_in_completed`         | `method`: email \| google \| github  | Successful sign-in           |
| `auth_sign_up_completed`         | `method`: email \| google \| github  | Successful registration      |
| `auth_sign_in_failed`            | `method`, `error_code`               | Sign-in error (no passwords) |
| `auth_forgot_password_submitted` | —                                    | Forgot-password email sent   |
| `account_provider_linked`        | `provider`, `action`: link \| unlink | Social account link/unlink   |

### Simulation

| Event                                | Properties                              | Trigger                      |
| ------------------------------------ | --------------------------------------- | ---------------------------- |
| `simulation_started`                 | `entry`: landing \| direct \| dashboard | Step 1 → next                |
| `simulation_car_info_submitted`      | `brand_id`, `fuel_type_id`              | Step 2 → next                |
| `simulation_completed`               | `result_code`, `situation`              | Engine result shown          |
| `simulation_manual_review_requested` | —                                       | Manual review email sent     |
| `simulation_confirmation_email_sent` | `member_path`                           | Confirmation email sent      |
| `simulation_restarted`               | `from_step`                             | Restart from result          |
| `simulation_cost_scenario_viewed`    | `scenario_index`                        | Cost scenario selected       |
| `step_N`                             | `result_code`                           | Legacy funnel steps (kept)   |
| `simulation` (server)                | full engine result                      | Simulation engine completion |

### FAQ & support

| Event                       | Properties                                                 | Trigger               |
| --------------------------- | ---------------------------------------------------------- | --------------------- |
| `support_chat_opened`       | `surface`: landing \| faq_fab \| simulation \| faq_article | Chat dialog opens     |
| `support_chat_message_sent` | `conversation_id`, `message_length`                        | Message sent          |
| `faq_search_executed`       | `query_length`, `result_count`                             | FAQ search (≥2 chars) |
| `faq_article_opened`        | `external_id`, `source`: hub \| group \| search            | Article link click    |

### Locale & dashboard

| Event                               | Properties                                          | Trigger                   |
| ----------------------------------- | --------------------------------------------------- | ------------------------- |
| `locale_changed`                    | `from`, `to`, `surface`: header \| menu \| settings | Locale PATCH success      |
| `non_default_locale_warning_viewed` | `locale`                                            | Non-NL warning icon click |
| `dashboard_card_clicked`            | `card`: simulation \| faq \| admin                  | Dashboard CTA             |

## Person properties

Set on identify / after key actions:

- `locale`, `role`, `email`, `name` (identify)
- `auth_method` — after sign-in/up
- `has_completed_simulation`, `last_simulation_result_code` — after simulation result

## Dashboards

PostHog dashboards in project **Default project**:

| Dashboard          | Link                                                                        |
| ------------------ | --------------------------------------------------------------------------- |
| Onboarding funnel  | [/dashboard/720665](https://eu.posthog.com/project/152797/dashboard/720665) |
| Login path clarity | [/dashboard/720666](https://eu.posthog.com/project/152797/dashboard/720666) |
| Auth & activation  | [/dashboard/720664](https://eu.posthog.com/project/152797/dashboard/720664) |
| Support & FAQ      | [/dashboard/720667](https://eu.posthog.com/project/152797/dashboard/720667) |
| Locale & i18n      | [/dashboard/720668](https://eu.posthog.com/project/152797/dashboard/720668) |
| Health             | [/dashboard/720669](https://eu.posthog.com/project/152797/dashboard/720669) |

## North Star

Primary: `simulation_completed` with `result_code` in `categoryA`, `categoryB`, or `manualReview`.

Guardrail: ratio of `login_dialog_option_clicked` (degapp vs onboarding) — validates login-path clarity.
