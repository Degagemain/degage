---
title: Public FAQ
roles:
  - technical
---

# Public FAQ

The public help hub at `/app/faq` lists FAQ questions (grouped) and, optionally, help articles. Grouped FAQ questions are limited to items
tagged `public_faq`, in addition to the viewer’s audience and `isFaq` / `isPublic` filters. The home page accordion uses the `landing_faq` tag.
The same item can also carry simulation or car-onboarding tags so it appears in those widgets as well.

## Articles section

The articles block on the FAQ hub is **disabled by default**. Other FAQ routes (`/app/faq/articles`, article detail pages, group pages) are
unchanged.

| Variable                           | Description                                                          |
| ---------------------------------- | -------------------------------------------------------------------- |
| `NEXT_PUBLIC_FAQ_ARTICLES_ENABLED` | When `true`, shows the articles section on `/app/faq`. Default: off. |

Enable in `.env`:

```bash
NEXT_PUBLIC_FAQ_ARTICLES_ENABLED=true
```
