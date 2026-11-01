---
title: Public FAQ
roles:
  - technical
---

# Public FAQ

The public help hub at `/app/faq` lists FAQ questions (grouped) and, optionally, help articles. Grouped FAQ questions are limited to items
tagged `public_faq`, in addition to the viewer’s audience and `isFaq` / `isPublic` filters. The home page accordion uses the `landing_faq` tag.
The same item can also carry simulation or car-onboarding tags so it appears in those widgets as well. An item tagged `simulation_all` shows on
the opening simulation page and on every later screen, together with that screen’s own list.

## Articles section

The articles block on the FAQ hub is controlled by the in-app feature flag `faq-articles` (Admin → Feature flags). It is **disabled by default**
when seeded. Other FAQ routes (`/app/faq/articles`, article detail pages, group pages) are unchanged.

## Short links

A FAQ item or article can store an optional `shortLink`. `/app/faq/articles/{shortLink}` renders the same page as
`/app/faq/articles/{externalId}` when no article uses that string as its external id. The value is stored lowercase and may contain letters,
numbers, and hyphens. The link is kept when the item is not public, but the public page still shows only public articles. Two items cannot share
one.
