import type { EmailTemplateTranslation } from '@/domain/email-template.model';
import { DEFAULT_LOCALE } from '@/domain/locale.model';

export const pickEmailTemplateTranslation = (
  translations: EmailTemplateTranslation[],
  locale: string | null | undefined,
): EmailTemplateTranslation | undefined => {
  if (locale) {
    const match = translations.find((translation) => translation.locale === locale);
    if (match) return match;
  }
  return translations.find((translation) => translation.locale === DEFAULT_LOCALE) ?? translations[0];
};
