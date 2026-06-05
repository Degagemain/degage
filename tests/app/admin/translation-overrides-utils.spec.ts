import { describe, expect, it } from 'vitest';
import { formatTranslationKeyPath, getEffectiveTranslationValue } from '@/app/admin/translation-overrides/translation-overrides-utils';

describe('translation override admin utils', () => {
  it('formats nested translation keys as a readable path', () => {
    expect(formatTranslationKeyPath(['admin', 'common', 'formActions', 'save_button'])).toBe('Admin > Common > Form Actions > Save Button');
  });

  it('uses overrides before original values for the current language', () => {
    expect(
      getEffectiveTranslationValue(
        {
          key: 'language.label',
          segments: ['language', 'label'],
          values: {
            en: { original: 'Language', override: 'Interface language', variables: [], updatedAt: null },
            nl: { original: 'Taal', override: null, variables: [], updatedAt: null },
            fr: { original: 'Langue', override: null, variables: [], updatedAt: null },
          },
        },
        'en',
      ),
    ).toBe('Interface language');
  });
});
