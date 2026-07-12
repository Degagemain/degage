---
title: MCP endpoints
roles:
  - technical
---

# MCP endpoints

Optional [Model Context Protocol](https://modelcontextprotocol.io/) server exposes documentation tools to external AI clients (e.g. Claude
Desktop). The feature is **disabled by default**.

## Enable

Set in `.env`:

```bash
MCP_ENABLED=true
```

Run database migrations so OAuth Provider tables exist (`pnpm db:migrate`).

## Endpoint

URL: `/mcp`

| Tool                          | OAuth scope | Description                                                                   |
| ----------------------------- | ----------- | ----------------------------------------------------------------------------- |
| `search_documentation`        | `mcp:user`  | List and search help documentation articles (non-admins see public docs only) |
| `search_documentation_groups` | `mcp:user`  | List and search documentation groups (labels for organising help articles)    |
| `search_fuel_types`           | `mcp:user`  | List and search fuel types with code, price, and CO₂ contribution             |
| `search_car_brands`           | `mcp:user`  | List and search car brands with code and locale names                         |
| `read_car_brand`              | `mcp:user`  | Read a single car brand by UUID                                               |
| `search_car_types`            | `mcp:user`  | List and search car types (requires brandId and fuelTypeId)                   |
| `update_documentation`        | `mcp:admin` | Replace a documentation article (full object, all translations required)      |
| `create_documentation_group`  | `mcp:admin` | Create a documentation group with sort order and locale translations          |
| `update_documentation_group`  | `mcp:admin` | Replace a documentation group (full object, all translations required)        |

MCP is a peer interface to REST (`/api/*`), not nested under it.

## OAuth

When `MCP_ENABLED=true`, Better Auth loads the [OAuth 2.1 Provider](https://better-auth.com/docs/plugins/oauth-provider) plugin with:

- Dynamic public client registration (for Claude-class clients)
- PKCE (S256)
- Scopes: `openid`, `profile`, `email`, `offline_access`, `mcp:user`, `mcp:admin`
- Consent UI at `/app/auth/consent`

Discovery:

- `/.well-known/oauth-authorization-server/api/auth` (canonical; root alias also served)
- `/.well-known/openid-configuration/api/auth`
- `/.well-known/oauth-protected-resource/mcp` (root alias also served)

Protected resource metadata lists the Better Auth issuer (`{BETTER_AUTH_URL}/api/auth`) in `authorization_servers`.

## Claude Desktop setup

1. Add remote MCP server URL .../mcp.
2. Complete browser OAuth (sign-up via social OAuth is smoothest).
3. Email/password sign-up may complete OAuth, but tools return an error until the email is verified.

## Authorization rules

- JWT audience must match `{BETTER_AUTH_URL}/mcp`.
- `tools/list` only includes tools the caller is allowed to use (scope, email verification, ban status, and admin role for
  `update_documentation`, `create_documentation_group`, and `update_documentation_group`).
- Each tool re-checks authorization at invocation time.
- Banned users are rejected.
- Unverified email/password users cannot call tools (OAuth may still complete).
- `update_documentation`, `create_documentation_group`, and `update_documentation_group` also require `admin` role at runtime.

## Code layout

- Config: `app/mcp/config.ts`
- Route: `app/mcp/route.ts`
- Tools: `app/mcp/tools/`
- Auth server: `app/auth.ts` (conditional `oauthProvider` + `jwt` plugins)
