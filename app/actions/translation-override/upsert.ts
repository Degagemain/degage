import { TranslationOverride, TranslationOverrideInput, translationOverrideInputSchema } from '@/domain/translation-override.model';
import { cacheTags, expireCacheTag } from '@/lib/cache-tags';
import { dbTranslationOverrideUpsert } from '@/storage/translation-override/translation-override.upsert';
import { validateTranslationOverrideAgainstMessages } from './validation';

export const upsertTranslationOverride = async (override: TranslationOverrideInput): Promise<TranslationOverride> => {
  const validated = translationOverrideInputSchema.parse(override);
  await validateTranslationOverrideAgainstMessages(validated);
  const saved = await dbTranslationOverrideUpsert(validated);
  expireCacheTag(cacheTags.translationOverrides);
  return saved;
};
