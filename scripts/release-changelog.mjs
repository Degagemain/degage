#!/usr/bin/env node

import { readFileSync, writeFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, '..');
const dryRun = process.argv.includes('--dry-run');

const CHANGELOG_PATH = join(rootDir, 'CHANGELOG.md');
const PACKAGE_JSON_PATH = join(rootDir, 'package.json');

const fail = (message) => {
  console.error(message);
  process.exit(1);
};

const patchBump = (version) => {
  const parts = version.split('.').map(Number);
  if (parts.length !== 3 || parts.some((n) => Number.isNaN(n))) {
    fail(`Invalid semver: ${version}`);
  }
  parts[2] += 1;
  return parts.join('.');
};

const parseChangelog = (content) => {
  const unreleasedMatch = content.match(/^## \[Unreleased\]\s*\n([\s\S]*?)(?=^## \[)/m);
  if (!unreleasedMatch) {
    fail('Could not find ## [Unreleased] section in CHANGELOG.md');
  }

  const unreleasedBody = unreleasedMatch[1].replace(/^\n+/, '').replace(/\n+$/, '');
  if (!/^- /m.test(unreleasedBody)) {
    fail('## [Unreleased] has no entries; nothing to release');
  }

  const versionMatch = content.match(/^## \[(\d+\.\d+\.\d+)\] - \d{4}-\d{2}-\d{2}/m);
  if (!versionMatch) {
    fail('Could not find latest released version in CHANGELOG.md');
  }

  const latestVersion = versionMatch[1];
  const header = content.slice(0, content.indexOf('## [Unreleased]'));
  const rest = content.slice(content.indexOf(versionMatch[0]));

  return { header, unreleasedBody, latestVersion, rest };
};

// Release date in UTC for consistent CI runs
const utcDate = () => new Date().toISOString().slice(0, 10);

const writeGithubOutput = (version, notes) => {
  const outputPath = process.env.GITHUB_OUTPUT;
  if (!outputPath) {
    console.log(`version=${version}`);
    console.log('--- notes ---');
    console.log(notes);
    return;
  }

  const delimiter = 'RELEASE_NOTES_EOF';
  writeFileSync(outputPath, `version=${version}\nnotes<<${delimiter}\n${notes}\n${delimiter}\n`, {
    flag: 'a',
  });
};

const main = () => {
  const changelog = readFileSync(CHANGELOG_PATH, 'utf8');
  const { header, unreleasedBody, latestVersion, rest } = parseChangelog(changelog);
  const version = patchBump(latestVersion);
  const date = utcDate();
  const notes = unreleasedBody;

  const newChangelog = `${header}` + '## [Unreleased]\n\n' + `## [${version}] - ${date}\n\n` + `${notes}\n\n` + `${rest}`;

  if (dryRun) {
    console.log(`Would release ${version}`);
    console.log('--- notes ---');
    console.log(notes);
    return;
  }

  writeFileSync(CHANGELOG_PATH, newChangelog);

  const pkg = JSON.parse(readFileSync(PACKAGE_JSON_PATH, 'utf8'));
  pkg.version = version;
  writeFileSync(PACKAGE_JSON_PATH, `${JSON.stringify(pkg, null, 2)}\n`);

  writeGithubOutput(version, notes);
};

main();
