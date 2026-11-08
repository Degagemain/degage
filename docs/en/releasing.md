---
title: Releasing
roles:
  - technical
---

# Releasing

Feature work writes notes to `unreleased/{feature-slug}.md` so concurrent changes do not conflict on `CHANGELOG.md`. Collect those files into
`[Unreleased]` yourself before cutting a version. The release workflow does not collect them.

Releases are created manually via the **Release** GitHub Action (`.github/workflows/release.yml`). The workflow:

1. Moves `[Unreleased]` entries in `CHANGELOG.md` into a new dated version (patch bump of the latest release).
2. Syncs `package.json` `version` to that number.
3. Commits, tags, and pushes to `main`.
4. Creates a GitHub Release whose body is exactly that changelog section.

## Collecting unreleased notes

Run this locally, review the changelog, and commit the result before starting a release:

```bash
pnpm changelog:collect
```

This merges every `unreleased/*.md` into `## [Unreleased]` and deletes the collected files. Dry-run:

```bash
pnpm changelog:collect -- --dry-run
```

## `RELEASE_TOKEN` secret

`main` is protected, so the default `GITHUB_TOKEN` cannot push commits or tags. Add a repository secret named **`RELEASE_TOKEN`**:

1. Create a fine-grained PAT (preferred) or classic PAT owned by a user who **can push to protected `main`** (admin, or an account allowed to
   bypass required pull requests).
2. Grant **Contents: Read and write** (enough to push and create releases). For fine-grained tokens, select this repository and enable Contents
   read/write.
3. Store it under **Settings → Secrets and variables → Actions → `RELEASE_TOKEN`**.

Without this secret, the workflow will fail when pushing the release commit.

## Running a release

1. Run `pnpm changelog:collect` if `unreleased/*.md` still has notes, then commit `CHANGELOG.md` and the removed note files.
2. Ensure `[Unreleased]` in `CHANGELOG.md` has at least one bullet entry.
3. On GitHub: **Actions → Release → Run workflow**.
4. Confirm the new commit, tag, and Release on `main`.

Local dry-run of the version bump (no file changes):

```bash
node scripts/release-changelog.mjs --dry-run
```
