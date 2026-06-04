import { TranslationCatalog } from '@/domain/translation-catalog.model';
import { type UILocale, uiLocales } from '@/i18n/locales';
import { getOriginalMessagesByLocale } from '@/i18n/message-files';
import { buildTranslationCatalog } from '@/i18n/message-utils';
import { listTranslationOverrides } from './list';

export const getTranslationCatalog = async (): Promise<TranslationCatalog> => {
  const [messagesByLocale, overrides] = await Promise.all([getOriginalMessagesByLocale(), listTranslationOverrides()]);
  const overridesByLocaleAndKey = new Map(overrides.map((override) => [`${override.locale}:${override.key}`, override]));

  return {
    locales: [...uiLocales],
    entries: buildTranslationCatalog(messagesByLocale).map((entry) => ({
      key: entry.key,
      segments: entry.segments,
      values: Object.fromEntries(
        uiLocales.map((locale) => {
          const override = overridesByLocaleAndKey.get(`${locale}:${entry.key}`);
          return [
            locale,
            {
              original: entry.values[locale],
              override: override?.value ?? null,
              variables: entry.variables[locale],
              updatedAt: override?.updatedAt?.toISOString() ?? null,
            },
          ];
        }),
      ) as TranslationCatalog['entries'][number]['values'],
    })),
  };
};

export const getOriginalValueForTranslationKey = async (key: string, locale: UILocale): Promise<string | null> => {
  const catalog = await getTranslationCatalog();
  const entry = catalog.entries.find((candidate) => candidate.key === key);
  return entry?.values[locale]?.original ?? null;
};
