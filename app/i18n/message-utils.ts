import { type UILocale, uiLocales } from './locales';

export type MessageRecord = Record<string, unknown>;

export interface TranslationLeaf {
  key: string;
  segments: string[];
  values: Record<UILocale, string | null>;
  variables: Record<UILocale, string[]>;
}

export interface TranslationOverridePatch {
  key: string;
  locale: UILocale;
  value: string;
}

type MessagesByLocale = Record<UILocale, MessageRecord>;

const emptyLocaleValues = (): Record<UILocale, string | null> =>
  uiLocales.reduce(
    (values, locale) => ({
      ...values,
      [locale]: null,
    }),
    {} as Record<UILocale, string | null>,
  );

const emptyLocaleVariables = (): Record<UILocale, string[]> =>
  uiLocales.reduce(
    (values, locale) => ({
      ...values,
      [locale]: [],
    }),
    {} as Record<UILocale, string[]>,
  );

export const extractTemplateVariables = (value: string): string[] => {
  const variables = new Set<string>();
  for (const match of value.matchAll(/\{(\w+)\}/g)) {
    variables.add(match[1]);
  }
  return [...variables].sort();
};

export const getMessageValueByKey = (messages: MessageRecord, key: string): string | null => {
  const value = key.split('.').reduce<unknown>((acc, segment) => {
    if (acc != null && typeof acc === 'object' && segment in acc) {
      return (acc as MessageRecord)[segment];
    }
    return undefined;
  }, messages);

  return typeof value === 'string' ? value : null;
};

export const validateOverrideVariables = (originalValue: string, overrideValue: string): string[] => {
  const allowedVariables = new Set(extractTemplateVariables(originalValue));
  return extractTemplateVariables(overrideValue).filter((variable) => !allowedVariables.has(variable));
};

const cloneMessages = (messages: MessageRecord): MessageRecord => JSON.parse(JSON.stringify(messages)) as MessageRecord;

export const setMessageValueByKey = (messages: MessageRecord, key: string, value: string): MessageRecord => {
  const segments = key.split('.');
  if (segments.length === 0) return messages;

  let current: MessageRecord = messages;
  for (const segment of segments.slice(0, -1)) {
    const next = current[segment];
    if (next == null || typeof next !== 'object' || Array.isArray(next)) {
      current[segment] = {};
    }
    current = current[segment] as MessageRecord;
  }
  current[segments[segments.length - 1]] = value;
  return messages;
};

export const applyMessageOverrides = (messages: MessageRecord, overrides: TranslationOverridePatch[]): MessageRecord => {
  const patched = cloneMessages(messages);
  for (const override of overrides) {
    setMessageValueByKey(patched, override.key, override.value);
  }
  return patched;
};

const collectStringLeaves = (messagesByLocale: MessagesByLocale): TranslationLeaf[] => {
  const leaves = new Map<string, TranslationLeaf>();

  const visit = (locale: UILocale, value: unknown, segments: string[]) => {
    if (typeof value === 'string') {
      const key = segments.join('.');
      const existing =
        leaves.get(key) ??
        ({
          key,
          segments,
          values: emptyLocaleValues(),
          variables: emptyLocaleVariables(),
        } satisfies TranslationLeaf);
      existing.values[locale] = value;
      existing.variables[locale] = extractTemplateVariables(value);
      leaves.set(key, existing);
      return;
    }

    if (value == null || typeof value !== 'object' || Array.isArray(value)) {
      return;
    }

    Object.entries(value as MessageRecord).forEach(([childKey, childValue]) => {
      visit(locale, childValue, [...segments, childKey]);
    });
  };

  uiLocales.forEach((locale) => visit(locale, messagesByLocale[locale], []));
  return [...leaves.values()].sort((a, b) => a.key.localeCompare(b.key));
};

export const buildTranslationCatalog = (messagesByLocale: MessagesByLocale): TranslationLeaf[] => collectStringLeaves(messagesByLocale);
