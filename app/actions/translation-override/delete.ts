import z from 'zod';
import { uiLocales } from '@/i18n/locales';
import { dbTranslationOverrideDelete, dbTranslationOverrideDeleteAll } from '@/storage/translation-override/translation-override.delete';

export const translationOverrideDeleteSchema = z.object({
  key: z.string().min(1),
  locale: z.enum(uiLocales),
});

export const deleteTranslationOverride = async (data: z.infer<typeof translationOverrideDeleteSchema>): Promise<void> => {
  const validated = translationOverrideDeleteSchema.parse(data);
  await dbTranslationOverrideDelete(validated.key, validated.locale);
};

export const deleteAllTranslationOverrides = async (): Promise<number> => dbTranslationOverrideDeleteAll();
