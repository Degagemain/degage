import { TranslationCatalog } from '@/domain/translation-catalog.model';
import { type UILocale } from '@/i18n/locales';
import { type HighlightedTextPart, getHighlightedTextParts } from '@/app/lib/highlight-text';

export type TranslationCatalogEntry = TranslationCatalog['entries'][number];
export type { HighlightedTextPart };
export { getHighlightedTextParts };

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
