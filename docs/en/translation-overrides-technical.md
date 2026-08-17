---
title: Translation overrides technical workflow
roles:
  - technical
---

# Translation overrides technical workflow

Translation overrides are stored in the `TranslationOverride` table with a message key, locale, and replacement value. Runtime message loading
keeps the JSON message files as the source of truth and applies database overrides on top.

## Applying overrides to message files

1. In the admin area, open **Translation overrides** and click **Download patch**.
2. Apply the patch from the repository root: `git apply translation-overrides.patch`
3. Review and commit the changed `messages/*.json` files.
4. Clear applied overrides from the admin page so the database no longer shadows the committed files.

Overrides are validated against the original message value for that locale. Replacement text may reuse existing `{template_variable}`
placeholders, but it cannot introduce new placeholders that were absent from the original value.

Public and owner prose is rendered with `InlineCopy`, which turns markdown-style links into anchors: a square-bracket label followed by a
parenthesized http, https, or mailto address. Use that syntax in message files and overrides for those screens. Do not put markdown links in
`placeholder`, `aria-label`, button labels, or other string-only call sites. Known app-owned URLs can still use `t.rich` with a mapped tag.
