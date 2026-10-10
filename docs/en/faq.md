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

## Short links

A public FAQ item or public article can store an optional `shortLink`. `/app/faq/{shortLink}` renders the same page as
`/app/faq/articles/{externalId}`. The value is stored lowercase and may contain letters, numbers, and hyphens. `articles` and `groups` are
reserved so a short link cannot replace the article list or a group page. An item that is not public does not keep a short link. Two items
cannot share one.
