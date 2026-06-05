import { TranslationCatalog } from '@/domain/translation-catalog.model';
import { type UILocale } from '@/i18n/locales';

export type TranslationCatalogEntry = TranslationCatalog['entries'][number];

export interface HighlightedTextPart {
  text: string;
  isMatch: boolean;
}

const formatSegment = (segment: string): string => {
  const words = segment
    .replace(/[-_]/g, ' ')
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  return words.map((word) => `${word.charAt(0).toUpperCase()}${word.slice(1)}`).join(' ');
};

export const formatTranslationKeyPath = (segments: string[]): string => segments.map(formatSegment).join(' > ');

export const getEffectiveTranslationValue = (entry: TranslationCatalogEntry, locale: UILocale): string =>
  entry.values[locale]?.override ?? entry.values[locale]?.original ?? '';

export const getTranslationSearchValues = (entry: TranslationCatalogEntry): string[] =>
  Object.values(entry.values)
    .flatMap((value) => [value.original, value.override])
    .filter((value): value is string => typeof value === 'string');

export const getHighlightedTextParts = (value: string, query: string): HighlightedTextPart[] => {
  const normalizedQuery = query.trim().toLowerCase();
  if (!normalizedQuery) return [{ text: value, isMatch: false }];

  const parts: HighlightedTextPart[] = [];
  const normalizedValue = value.toLowerCase();
  let cursor = 0;
  let matchIndex = normalizedValue.indexOf(normalizedQuery);

  while (matchIndex !== -1) {
    if (matchIndex > cursor) {
      parts.push({ text: value.slice(cursor, matchIndex), isMatch: false });
    }
    const matchEnd = matchIndex + normalizedQuery.length;
    parts.push({ text: value.slice(matchIndex, matchEnd), isMatch: true });
    cursor = matchEnd;
    matchIndex = normalizedValue.indexOf(normalizedQuery, cursor);
  }

  if (cursor < value.length) {
    parts.push({ text: value.slice(cursor), isMatch: false });
  }

  return parts.length > 0 ? parts : [{ text: value, isMatch: false }];
};
