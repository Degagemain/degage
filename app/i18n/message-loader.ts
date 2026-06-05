import { listTranslationOverridesForLocale } from '@/actions/translation-override/list';
import { type MessageRecord, applyMessageOverrides } from './message-utils';
import { type UILocale } from './locales';
import { getOriginalMessagesForLocale } from './message-files';

export const getMergedMessagesForLocale = async (locale: UILocale): Promise<MessageRecord> => {
  const originalMessages = await getOriginalMessagesForLocale(locale);
  try {
    const overrides = await listTranslationOverridesForLocale(locale);
    return applyMessageOverrides(
      originalMessages,
      overrides.map((override) => ({ key: override.key, locale, value: override.value })),
    );
  } catch {
    return originalMessages;
  }
};
