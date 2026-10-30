import { TranslationOverride, TranslationOverrideInput, translationOverrideInputSchema } from '@/domain/translation-override.model';
import { dbTranslationOverrideUpsert } from '@/storage/translation-override/translation-override.upsert';
import { expireTranslationOverridesCache } from './translation-override-cache';
import { validateTranslationOverrideAgainstMessages } from './validation';

export const upsertTranslationOverride = async (override: TranslationOverrideInput): Promise<TranslationOverride> => {
  const validated = translationOverrideInputSchema.parse(override);
  await validateTranslationOverrideAgainstMessages(validated);
  const saved = await dbTranslationOverrideUpsert(validated);
  expireTranslationOverridesCache();
  return saved;
};
