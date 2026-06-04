import { TranslationOverride } from '@/domain/translation-override.model';
import { dbTranslationOverrideList, dbTranslationOverrideListForLocale } from '@/storage/translation-override/translation-override.list';
import { type UILocale } from '@/i18n/locales';

export const listTranslationOverrides = async (): Promise<TranslationOverride[]> => dbTranslationOverrideList();

export const listTranslationOverridesForLocale = async (locale: UILocale): Promise<TranslationOverride[]> =>
  dbTranslationOverrideListForLocale(locale);
