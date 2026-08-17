import { describe, expect, it } from 'vitest';

import { documentationTranslationsFromLocaleRecords } from '@/app/admin/documentation/components/documentation-translations-from-locale-records';
import { emptyContentLocaleRecord } from '@/app/components/form/empty-content-locale-record';

describe('documentationTranslationsFromLocaleRecords', () => {
  it('keeps only locales that have a title', () => {
    const title = emptyContentLocaleRecord();
    const content = emptyContentLocaleRecord();
    title.nl = 'Nederlandse titel';
    content.nl = 'Nederlandse inhoud';
    content.fr = 'Contenu sans titre';

    expect(documentationTranslationsFromLocaleRecords(title, content)).toEqual([
      { locale: 'nl', title: 'Nederlandse titel', content: 'Nederlandse inhoud' },
    ]);
  });

  it('returns no translations when every title is blank', () => {
    const title = emptyContentLocaleRecord();
    const content = emptyContentLocaleRecord();
    content.en = 'Orphan content';

    expect(documentationTranslationsFromLocaleRecords(title, content)).toEqual([]);
  });

  it('trims titles and keeps empty content for filled locales', () => {
    const title = emptyContentLocaleRecord();
    const content = emptyContentLocaleRecord();
    title.en = '  English  ';
    title.fr = 'Français';

    expect(documentationTranslationsFromLocaleRecords(title, content)).toEqual([
      { locale: 'en', title: 'English', content: '' },
      { locale: 'fr', title: 'Français', content: '' },
    ]);
  });
});
