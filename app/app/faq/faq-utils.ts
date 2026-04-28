import type { Documentation } from '@/domain/documentation.model';
import { defaultContentLocale } from '@/i18n/locales';

export function pickDocumentationTranslation(doc: Documentation, locale: string) {
  const byLocale = doc.translations.find((t) => t.locale === locale);
  const byDefault = doc.translations.find((t) => t.locale === defaultContentLocale);
  return byLocale ?? byDefault ?? doc.translations[0];
}

export function excerptFromMarkdown(content: string, max = 160): string {
  const stripped = content
    .replace(/^#+\s+/gm, '')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\[([^\]]+)]\([^)]+\)/g, '$1')
    .replace(/\n+/g, ' ')
    .trim();
  if (stripped.length <= max) {
    return stripped;
  }
  return `${stripped.slice(0, max)}…`;
}
