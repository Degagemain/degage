---
name: dependency-security-upgrades
description: >-
  Scan a repository's dependency security alerts and plan or apply upgrades
  that respect peer dependencies, migration notes, and the deploy runtime.
  Use when the user asks to read security or Dependabot alerts, upgrade
  packages, bump dependencies, or close vulnerability advisories.
---

# Dependency security upgrades

Scan first, then plan, then change code. Present the plan and wait for an explicit yes before editing, unless the user already said to implement.

## Rules that do not bend

- Take the newest published **stable** release that the other packages still accept. A large jump is allowed when the migration notes are additive, or the application does not use the APIs that were removed.
- Skip release candidates, alphas, betas, and versions the maintainer still marks experimental. Do not turn on an opt-in experimental framework feature as part of the upgrade.
- Stop before a version whose peer range forces another direct dependency off a line that dependency still requires. Say which package blocks the jump.
- Do not add selector overrides (`pnpm` overrides, npm overrides, Yarn resolutions) to force a transitive version. If an existing override is what pins a vulnerable line, and the parents' ranges already allow the fix, delete the override. A normal install, then an in-range update of the packages named in the alerts, should let those ranges move forward.
- An optional peer that the app does not use can pull a vulnerable package back in after that override is gone. Strip that unused peer in the package manager's read-package hook, and explain why in that file. Do not copy the explanation into a known-issues page.
- Read the migration notes for every package you move, and for the packages that peer it, covering the versions between current and target. Do this before choosing the target, not after the install fails.
- Match the language runtime to a version the production host actually runs for builds and functions. Make CI install that same major. A developer machine on a newer runtime is not a reason to raise the project's declared version.
- Check recent commits for CI or image pins that exist only because a tool could not run on the current host image. If a newer stable release of that tool removes the pin, take the release and remove the pin.
- Do not reset a database to get past pre-existing migration drift. Apply the upgrade's schema change without destroying data, and tell the user which drift remains.

## Scan

1. List open dependency alerts for this repository (Dependabot, or the host's equivalent). Group them by the **parent** that installs the vulnerable package, not by each transitive copy.
2. For each group, record the vulnerable package, the installed version, the patched version, and which direct dependency pulls it in (`pnpm why`, `npm why`, or `yarn why`).
3. Read direct dependency ranges, peer ranges, the lockfile, and any existing overrides. Note exact pins that block a parent from moving.

One parent bump should be the plan for every alert that parent closes. Do not pin each transitive separately.

## Plan

Write the plan in groups, not as a flat list of version numbers. For each group:

- Current version, who depends on it, and which alerts it closes.
- Target version, and the migration notes that justify stopping there.
- What you will not upgrade, and which peer or stability rule blocks it.
- Runtime and CI changes, if the declared runtime and the CI install disagree, or if a tool pin is obsolete.
- How in-range transitive copies get refreshed after the specifier change.

Call out schema or API migrations the target requires. Leave unrelated direct dependencies alone when they are not holding a vulnerable parent back.

## Implement

After the user accepts the plan:

1. Change direct specifiers to the chosen stable versions. Delete overrides that were pinning a vulnerable line. Add a read-package hook only for the unused-peer case above.
2. Install, then update the alerted transitive packages in place so ranges that already allow the fix actually resolve to it. Do not upgrade the package manager itself unless the plan said to.
3. Regenerate generated clients the upgrade requires. Follow the project's migration flow for schema changes. If the migration tool wants a reset because of drift that is not part of this upgrade, stop and report it.
4. Fix compile and test fallout from the upgrade. If a test runner changes a default (for example clearing mocks between tests), fix the tests that assumed the old default. Turn the new default off only when the failures are widespread.
5. Confirm the lockfile: the deleted override is gone, the patched versions are present, and packages that were supposed to leave with a removed parent are absent.

## Verify

Run the project's unit tests, lint, and production build. Use the non-watch test command.

When the upgrade touches the framework, UI, styling, auth, or routing, walk the running app after the build:

- Save one desktop screenshot per page under `/tmp`, named after the route. Do not commit the screenshots. They stay outside the repo so they can be attached to a pull request later.
- Sign in with the seeded development account when member and admin routes need it. Do not submit creates, edits, or deletes.
- Open each important section's list, its new form when that route exists, and one existing detail when a row is present. Skip a detail only when the list is empty, and write that down.
- If a page fails because of the upgrade, fix it and retake that screenshot.

## Commits

When the user asks to commit, use a few commits, not one per package: dependency and lockfile changes, application and schema migration, then CI. Follow the repository's commit message style. Keep body lines inside the repo's commit-message length limit.
