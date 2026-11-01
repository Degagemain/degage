---
name: fully-self-driving
description: >-
  Implement one or more tickets end to end in a linked git worktree:
  read the planning issues or a short spec, branch from staging, implement,
  changelog, verify, then commit, push, and open one pull request against
  staging. Several tickets become one commit each, in that single PR. Use when
  the user asks to fully self-drive, implement a ticket on its own, or names
  this skill. The ticket repository comes from the link the user gives.
disable-model-invocation: true
---

# Fully self-driving

Ship the tickets from a linked worktree through one pull request. Invoking this skill means commit, push, and open the PR.

Several tickets stay one branch and one PR, with one commit per ticket, in the order given. A short spec with no ticket is one commit. Keep going between steps. Ask and wait only when a gate or a spec needs an answer.

## Gates

Run `git status`.

On `staging` or `main`, tell the user to open a worktree and start this skill there. From this checkout:

```bash
pnpm worktree:new -- feat/short-name
```

That adds a sibling folder (`<repo>-feat-short-name`), copies `.env`, and gives that checkout its own database and port. See `docs/en/local-development.md`.

When the tree is dirty, or the branch is already ahead, ask whether to continue that branch.

A clean feature branch is ready. Continue.

Before `pnpm dev`, a Cursor worktree with `.env` and no database yet needs `pnpm db:start && pnpm db:migrate && pnpm db:seed && pnpm db:seed-dev-account`. That applies existing migrations. A new migration is the command you give the user: `pnpm db:migrate -- --name <snake_name>`.

## What to build

Take a ticket link from the message. The repository and number come from that URL. Read it with `gh issue view` on the URL. The body is the spec. Read the parent or the comments when the body points at a decision that is not in the body.

A short spec in the message is enough when there is no ticket. When neither is there, ask for a link or a spec.

Build when the Dev board status is Development, or the body already says the behavior and done-when. Otherwise say what is missing and wait. A sentence in the user message wins when it conflicts with the ticket. Say that in the PR.

## Plan

Write a short plan in the reply: one block per ticket, with behavior, files, and how you will check it.

When a second reasonable reading would ship different behavior, ask. Name the readings. Wait for the answer, and treat it as the spec. Start the other tickets after every spec is clear.

When every spec is clear, implement in the same turn.

## Implement

Work in the given order. Finish a ticket, write its release note, and commit it before starting the next. Conventional Commits, one line, why that ticket. Follow the surrounding code and `.cursor/rules/`. Schema changes go in `schema.prisma`.

## Release notes

Follow `.cursor/rules/release-notes.mdc`. The note belongs in that ticket's commit.

## Verify

When a person can click or see the change locally, run `pnpm dev` and exercise that flow, then fix what fails. For an external system (mail, PostHog, payments, GCP, OAuth, Documenso) or a change with nothing to click, rely on tests and say so.

## Checks

After the last ticket is committed, fix until these pass:

```bash
pnpm fix
pnpm vitest --no-watch
pnpm build
```

Add or update tests for the layer you changed. `tests/` mirrors `app/`.

A fix that belongs to one ticket amends that unpushed commit. When a fix spans tickets, say so and wait.

## Push and pull request

Fetch `staging` and rebase onto it when `origin/staging` is not already under `HEAD`:

```bash
git fetch origin staging
git merge-base --is-ancestor origin/staging HEAD || git rebase origin/staging
```

Resolve a conflict and continue. Re-run the checks when you had to edit one. Then:

```bash
git push -u origin HEAD
gh pr create --base staging --title "<batch title>" --body "$(cat <<'EOF'
## Summary
- …

## Test plan
- [ ] …

EOF
)"
```

One summary bullet per ticket.

Reply with the PR URL, the branch, and anything still unverified, including a migration the user still generates.
