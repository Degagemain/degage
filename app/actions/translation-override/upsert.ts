import { TranslationOverride, TranslationOverrideInput, translationOverrideInputSchema } from '@/domain/translation-override.model';
import { dbTranslationOverrideUpsert } from '@/storage/translation-override/translation-override.upsert';
import { validateTranslationOverrideAgainstMessages } from './validation';

export const upsertTranslationOverride = async (override: TranslationOverrideInput): Promise<TranslationOverride> => {
  const validated = translationOverrideInputSchema.parse(override);
  await validateTranslationOverrideAgainstMessages(validated);
  return dbTranslationOverrideUpsert(validated);
};
