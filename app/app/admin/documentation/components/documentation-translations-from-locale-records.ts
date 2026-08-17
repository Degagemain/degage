import type { DocumentationTranslation } from '@/domain/documentation.model';
import { type ContentLocale, contentLocales } from '@/i18n/locales';

export const documentationTranslationsFromLocaleRecords = (
  titleByLocale: Record<ContentLocale, string>,
  contentByLocale: Record<ContentLocale, string>,
): DocumentationTranslation[] =>
  contentLocales.flatMap((locale) => {
    const title = titleByLocale[locale]?.trim() ?? '';
    if (!title) {
      return [];
    }
    return [{ locale, title, content: contentByLocale[locale] ?? '' }];
  });
