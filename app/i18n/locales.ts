import { DEFAULT_LOCALE } from '@/domain/locale.model';

// ============================================
// UI LOCALES — Supported in message files
// ============================================

export const uiLocales = ['en', 'nl', 'fr'] as const;
export type UILocale = (typeof uiLocales)[number];
export const defaultUILocale: UILocale = DEFAULT_LOCALE;

// ============================================
// CONTENT LOCALES — Supported in database
// ============================================

export const contentLocales = ['en', 'nl', 'fr'] as const;
export type ContentLocale = (typeof contentLocales)[number];
export const defaultContentLocale: ContentLocale = DEFAULT_LOCALE;

export function isContentLocale(locale: string): locale is ContentLocale {
  return contentLocales.includes(locale as ContentLocale);
}

export function getContentLocale(uiLocale: string): ContentLocale {
  if (isContentLocale(uiLocale)) {
    return uiLocale;
  }
  return defaultContentLocale;
}

// ============================================
// DISPLAY NAMES
// ============================================

export const localeDisplayNames: Record<UILocale, string> = {
  en: 'English',
  nl: 'Nederlands',
  fr: 'Français',
};
