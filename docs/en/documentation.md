---
title: Documentation
roles:
  - admin
---

# Documentation

Central place for help content from the repository, Notion, or manual records (created via the API). The admin zone lists entries; create and
edit UIs are not shown for now.

Use the **Sync** button to refresh search embeddings after major documentation updates. Sync reports totals for updated, skipped, and failed
records.

| Property    | Description                                                                                                                                                                                                              |
| ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| External ID | Stable identifier; repository docs use `repo:{topic}`, Notion uses `notion:{page-id}`, manual entries can use `manual:…`.                                                                                                |
| Source      | Where the record is managed: repository (seeded from `docs/`), Notion (synced via webhook), or manual (API).                                                                                                             |
| Format      | `markdown` or plain `text`.                                                                                                                                                                                              |
| FAQ         | When enabled, the item can be listed in FAQ widgets that filter by tags.                                                                                                                                                 |
| Audience    | Who may view the page in the app: technical, admin, user, public (technical/admin pages are only visible to administrators). In the documentation list, each assigned role appears as its own label in the Roles column. |
| Tags        | Labels such as `simulation_step_1`; `simulation_step_2_approved`, `simulation_step_2_rejected`, `simulation_step_2_review` (result step); `simulation_step_3`; `simulation_step_4` for targeting FAQ lists.              |
| Title       | Per language (English, Dutch, French).                                                                                                                                                                                   |
| Content     | Per language; Markdown is supported when format is markdown.                                                                                                                                                             |
| Embeddings  | Admin action to regenerate AI-search embeddings for current documentation content and review sync counters (updated/skipped/failed).                                                                                     |
