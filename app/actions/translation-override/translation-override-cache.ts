import { revalidateTag } from 'next/cache';

export const translationOverridesCacheTag = 'translation-overrides';

export const expireTranslationOverridesCache = (): void => {
  revalidateTag(translationOverridesCacheTag, { expire: 0 });
};
