import { unstable_cache } from 'next/cache';

import { listTranslationOverridesForLocale } from '@/actions/translation-override/list';
import { cacheTags } from '@/lib/cache-tags';
import { type MessageRecord, applyMessageOverrides } from './message-utils';
import { type UILocale } from './locales';
import { getOriginalMessagesForLocale } from './message-files';

const getCachedOverridesForLocale = unstable_cache(
  async (locale: UILocale) => (await listTranslationOverridesForLocale(locale)).map(({ key, value }) => ({ key, locale, value })),
  ['translation-overrides-for-locale'],
  { tags: [cacheTags.translationOverrides] },
);

export const getMergedMessagesForLocale = async (locale: UILocale): Promise<MessageRecord> => {
  const originalMessages = await getOriginalMessagesForLocale(locale);
  try {
    const overrides = await getCachedOverridesForLocale(locale);
    return applyMessageOverrides(originalMessages, overrides);
  } catch {
    return originalMessages;
  }
};
