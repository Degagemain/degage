import { TranslationOverrideInput } from '@/domain/translation-override.model';
import { getOriginalMessagesForLocale } from '@/i18n/message-files';
import { getMessageValueByKey, validateOverrideVariables } from '@/i18n/message-utils';

export class TranslationOverrideValidationError extends Error {
  constructor(
    message: string,
    public readonly details: string[] = [],
  ) {
    super(message);
    this.name = 'TranslationOverrideValidationError';
  }
}

export const validateTranslationOverrideAgainstMessages = async (override: TranslationOverrideInput): Promise<void> => {
  const messages = await getOriginalMessagesForLocale(override.locale);
  const originalValue = getMessageValueByKey(messages, override.key);
  if (originalValue == null) {
    throw new TranslationOverrideValidationError('Translation key does not exist for this locale.');
  }

  const invalidVariables = validateOverrideVariables(originalValue, override.value);
  if (invalidVariables.length > 0) {
    throw new TranslationOverrideValidationError('Override contains template variables that are not in the original value.', invalidVariables);
  }
};
