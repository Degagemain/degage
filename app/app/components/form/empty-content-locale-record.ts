import { ContentLocale, contentLocales } from '@/i18n/locales';

export function emptyContentLocaleRecord(): Record<ContentLocale, string> {
  return Object.fromEntries(contentLocales.map((locale) => [locale, ''])) as Record<ContentLocale, string>;
}
