---
title: Releasing
roles:
  - technical
---

# Releasing

Releases are created manually via the **Release** GitHub Action (`.github/workflows/release.yml`). The workflow:

1. Moves `[Unreleased]` entries in `CHANGELOG.md` into a new dated version (patch bump of the latest release).
2. Syncs `package.json` `version` to that number.
3. Commits, tags, and pushes to `main`.
4. Creates a GitHub Release whose body is exactly that changelog section.

## `RELEASE_TOKEN` secret

`main` is protected, so the default `GITHUB_TOKEN` cannot push commits or tags. Add a repository secret named **`RELEASE_TOKEN`**:

1. Create a fine-grained PAT (preferred) or classic PAT owned by a user who **can push to protected `main`** (admin, or an account allowed to
   bypass required pull requests).
2. Grant **Contents: Read and write** (enough to push and create releases). For fine-grained tokens, select this repository and enable Contents
   read/write.
3. Store it under **Settings → Secrets and variables → Actions → `RELEASE_TOKEN`**.

Without this secret, the workflow will fail when pushing the release commit.

## Running a release

1. Ensure `[Unreleased]` in `CHANGELOG.md` has at least one bullet entry.
2. On GitHub: **Actions → Release → Run workflow**.
3. Confirm the new commit, tag, and Release on `main`.

Local dry-run (no file changes):

```bash
node scripts/release-changelog.mjs --dry-run
```
