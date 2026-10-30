import z from 'zod';
import { uiLocales } from '@/i18n/locales';
import { dbTranslationOverrideDelete, dbTranslationOverrideDeleteAll } from '@/storage/translation-override/translation-override.delete';
import { expireTranslationOverridesCache } from './translation-override-cache';

export const translationOverrideDeleteSchema = z.object({
  key: z.string().min(1),
  locale: z.enum(uiLocales),
});

export const deleteTranslationOverride = async (data: z.infer<typeof translationOverrideDeleteSchema>): Promise<void> => {
  const validated = translationOverrideDeleteSchema.parse(data);
  await dbTranslationOverrideDelete(validated.key, validated.locale);
  expireTranslationOverridesCache();
};

export const deleteAllTranslationOverrides = async (): Promise<number> => {
  const deleted = await dbTranslationOverrideDeleteAll();
  expireTranslationOverridesCache();
  return deleted;
};
