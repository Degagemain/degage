import { describe, expect, it } from 'vitest';
import {
  formatTranslationKeyPath,
  getEffectiveTranslationValue,
  getHighlightedTextParts,
} from '@/app/admin/translation-overrides/translation-overrides-utils';

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

  it('splits highlighted search matches case-insensitively', () => {
    expect(getHighlightedTextParts('Interface language label', 'LANG')).toEqual([
      { text: 'Interface ', isMatch: false },
      { text: 'lang', isMatch: true },
      { text: 'uage label', isMatch: false },
    ]);
  });

  it('highlights repeated search matches', () => {
    expect(getHighlightedTextParts('test Test tester', 'test')).toEqual([
      { text: 'test', isMatch: true },
      { text: ' ', isMatch: false },
      { text: 'Test', isMatch: true },
      { text: ' ', isMatch: false },
      { text: 'test', isMatch: true },
      { text: 'er', isMatch: false },
    ]);
  });
});
