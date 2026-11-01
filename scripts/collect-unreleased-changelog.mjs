#!/usr/bin/env node

import { readFileSync, readdirSync, unlinkSync, writeFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, '..');
const dryRun = process.argv.includes('--dry-run');
const allowEmpty = process.argv.includes('--allow-empty');

const CHANGELOG_PATH = join(rootDir, 'CHANGELOG.md');
const UNRELEASED_DIR = join(rootDir, 'unreleased');
const SECTION_NAMES = ['Public features', 'Admin features', 'Technical'];

const fail = (message) => {
  console.error(message);
  process.exit(1);
};

const emptySections = () => Object.fromEntries(SECTION_NAMES.map((name) => [name, []]));

const parseSections = (markdown) => {
  const sections = emptySections();
  let current = null;

  for (const rawLine of markdown.replace(/\r\n/g, '\n').split('\n')) {
    const heading = rawLine.match(/^###\s+(.+?)\s*$/);
    if (heading) {
      current = SECTION_NAMES.includes(heading[1]) ? heading[1] : null;
      continue;
    }

    const bullet = rawLine.trim();
    if (current && /^- /.test(bullet) && !sections[current].includes(bullet)) {
      sections[current].push(bullet);
    }
  }

  return sections;
};

const mergeSections = (...groups) => {
  const merged = emptySections();
  for (const group of groups) {
    for (const name of SECTION_NAMES) {
      for (const bullet of group[name]) {
        if (!merged[name].includes(bullet)) {
          merged[name].push(bullet);
        }
      }
    }
  }
  return merged;
};

const formatUnreleased = (sections) => {
  const parts = ['## [Unreleased]', ''];
  for (const name of SECTION_NAMES) {
    if (sections[name].length === 0) {
      continue;
    }
    parts.push(`### ${name}`, ...sections[name], '');
  }
  return `${parts.join('\n')}\n`;
};

const listNoteFiles = () =>
  readdirSync(UNRELEASED_DIR)
    .filter((name) => name.endsWith('.md'))
    .sort()
    .map((name) => join(UNRELEASED_DIR, name));

const splitChangelog = (content) => {
  const marker = '## [Unreleased]';
  const start = content.indexOf(marker);
  if (start === -1) {
    fail('Could not find ## [Unreleased] section in CHANGELOG.md');
  }

  const header = content.slice(0, start);
  const after = content.slice(start + marker.length);
  const nextHeading = after.search(/^## \[/m);
  const existingBody = (nextHeading === -1 ? after : after.slice(0, nextHeading)).trim();
  const rest = nextHeading === -1 ? '' : after.slice(nextHeading);

  return { header, existingBody, rest };
};

const main = () => {
  const files = listNoteFiles();
  if (files.length === 0) {
    if (allowEmpty) {
      console.log('No unreleased/*.md notes to collect');
      return;
    }
    fail('No unreleased/*.md notes to collect');
  }

  const collected = mergeSections(...files.map((file) => parseSections(readFileSync(file, 'utf8'))));
  if (SECTION_NAMES.every((name) => collected[name].length === 0)) {
    fail('unreleased/*.md files contain no changelog bullets');
  }

  const changelog = readFileSync(CHANGELOG_PATH, 'utf8');
  const { header, existingBody, rest } = splitChangelog(changelog);
  const sections = mergeSections(parseSections(existingBody), collected);
  const newChangelog = `${header}${formatUnreleased(sections)}${rest.startsWith('\n') || rest === '' ? '' : '\n'}${rest}`;

  if (dryRun) {
    console.log(`Would collect ${files.length} file(s) into CHANGELOG.md`);
    console.log('--- notes ---');
    console.log(formatUnreleased(sections).trim());
    return;
  }

  writeFileSync(CHANGELOG_PATH, newChangelog);
  for (const file of files) {
    unlinkSync(file);
  }

  console.log(`Collected ${files.length} file(s) into CHANGELOG.md`);
};

main();
