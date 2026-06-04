import { readFile } from 'node:fs/promises';
import path from 'node:path';

import { uiLocales } from '@/i18n/locales';
import { type MessageRecord, getMessageValueByKey, setMessageValueByKey } from '@/i18n/message-utils';
import { listTranslationOverrides } from './list';

const normalizeWithTrailingNewline = (value: string): string => (value.endsWith('\n') ? value : `${value}\n`);

const fullFileUnifiedDiff = (filePath: string, before: string, after: string): string => {
  const beforeNormalized = normalizeWithTrailingNewline(before);
  const afterNormalized = normalizeWithTrailingNewline(after);
  if (beforeNormalized === afterNormalized) return '';

  const beforeLines = beforeNormalized.slice(0, -1).split('\n');
  const afterLines = afterNormalized.slice(0, -1).split('\n');
  return [
    `diff --git a/${filePath} b/${filePath}`,
    `--- a/${filePath}`,
    `+++ b/${filePath}`,
    `@@ -1,${beforeLines.length} +1,${afterLines.length} @@`,
    ...beforeLines.map((line) => `-${line}`),
    ...afterLines.map((line) => `+${line}`),
    '',
  ].join('\n');
};

const applyOverridesToMessageFile = (content: string, overrides: { key: string; value: string }[]): string => {
  const messages = JSON.parse(content) as MessageRecord;
  for (const override of overrides) {
    if (getMessageValueByKey(messages, override.key) != null) {
      setMessageValueByKey(messages, override.key, override.value);
    }
  }
  return `${JSON.stringify(messages, null, 2)}\n`;
};

export const generateTranslationOverridePatch = async (): Promise<string> => {
  const overrides = await listTranslationOverrides();
  const diffs = await Promise.all(
    uiLocales.map(async (locale) => {
      const filePath = `messages/${locale}.json`;
      const absolutePath = path.join(process.cwd(), filePath);
      const before = await readFile(absolutePath, 'utf8');
      const localeOverrides = overrides.filter((override) => override.locale === locale);
      if (localeOverrides.length === 0) {
        return '';
      }
      const after = applyOverridesToMessageFile(
        before,
        localeOverrides.map((override) => ({ key: override.key, value: override.value })),
      );
      return fullFileUnifiedDiff(filePath, before, after);
    }),
  );

  return diffs.filter(Boolean).join('\n');
};
