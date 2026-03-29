import { describe, expect, it } from 'vitest';

import { mergeTranslationRowsWithPreservedContentHash } from '@/storage/documentation/documentation.translation-content-hash';

describe('mergeTranslationRowsWithPreservedContentHash', () => {
  it('preserves contentHash when title and content are unchanged', () => {
    const merged = mergeTranslationRowsWithPreservedContentHash(
      [{ locale: 'nl', title: 'T', content: 'C', contentHash: 'abc' }],
      [{ locale: 'nl', title: 'T', content: 'C' }],
    );
    expect(merged).toEqual([{ locale: 'nl', title: 'T', content: 'C', contentHash: 'abc' }]);
  });

  it('sets contentHash to null when body changes', () => {
    const merged = mergeTranslationRowsWithPreservedContentHash(
      [{ locale: 'nl', title: 'T', content: 'old', contentHash: 'abc' }],
      [{ locale: 'nl', title: 'T', content: 'new' }],
    );
    expect(merged).toEqual([{ locale: 'nl', title: 'T', content: 'new', contentHash: null }]);
  });

  it('sets contentHash to null for new locales', () => {
    const merged = mergeTranslationRowsWithPreservedContentHash([], [{ locale: 'nl', title: 'T', content: 'C' }]);
    expect(merged).toEqual([{ locale: 'nl', title: 'T', content: 'C', contentHash: null }]);
  });
});
