import { type UILocale, uiLocales } from './locales';
import { type MessageRecord } from './message-utils';

export const getOriginalMessagesForLocale = async (locale: UILocale): Promise<MessageRecord> => {
  const messages = (await import(`../../messages/${locale}.json`)).default;
  return messages as MessageRecord;
};

export const getOriginalMessagesByLocale = async (): Promise<Record<UILocale, MessageRecord>> => {
  const entries = await Promise.all(uiLocales.map(async (locale) => [locale, await getOriginalMessagesForLocale(locale)] as const));
  return Object.fromEntries(entries) as Record<UILocale, MessageRecord>;
};
