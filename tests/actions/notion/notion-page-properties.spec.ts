import { describe, expect, it } from 'vitest';

import {
  getNotionMultiSelectNames,
  getNotionPageProperty,
  getNotionPropertyPlainText,
  parseLocaleNotionPropertyMap,
} from '@/actions/notion/notion-page-properties';

describe('parseLocaleNotionPropertyMap', () => {
  it('returns empty object for undefined or blank', () => {
    expect(parseLocaleNotionPropertyMap(undefined)).toEqual({});
    expect(parseLocaleNotionPropertyMap('')).toEqual({});
    expect(parseLocaleNotionPropertyMap('  ')).toEqual({});
  });

  it('parses locale=property pairs', () => {
    expect(parseLocaleNotionPropertyMap('en=Title EN,nl=Titel NL,fr=Titre FR')).toEqual({
      en: 'Title EN',
      nl: 'Titel NL',
      fr: 'Titre FR',
    });
  });

  it('ignores invalid locales and malformed segments', () => {
    expect(parseLocaleNotionPropertyMap('en=Body EN,xx=Bad,de=Also bad,nl=')).toEqual({
      en: 'Body EN',
    });
  });
});

describe('getNotionPropertyPlainText', () => {
  it('reads rich_text by exact name', () => {
    const page = {
      properties: {
        'Content EN': {
          type: 'rich_text',
          rich_text: [{ plain_text: 'Hello', type: 'text' }],
        },
      },
    };
    expect(getNotionPropertyPlainText(page, 'Content EN')).toBe('Hello');
  });

  it('matches property name case-insensitively', () => {
    const page = {
      properties: {
        'title nl': {
          type: 'rich_text',
          rich_text: [{ plain_text: 'Titel', type: 'text' }],
        },
      },
    };
    expect(getNotionPropertyPlainText(page, 'Title NL')).toBe('Titel');
  });

  it('reads title-type property', () => {
    const page = {
      properties: {
        Name: {
          type: 'title',
          title: [{ plain_text: 'Doc', type: 'text' }],
        },
      },
    };
    expect(getNotionPropertyPlainText(page, 'Name')).toBe('Doc');
  });

  it('returns empty string when missing', () => {
    expect(getNotionPropertyPlainText({ properties: {} }, 'Nope')).toBe('');
  });
});

describe('getNotionPageProperty', () => {
  it('resolves property case-insensitively', () => {
    const page = { properties: { Tags: { type: 'multi_select', multi_select: [] } } };
    expect(getNotionPageProperty(page, 'tags')).toEqual({ type: 'multi_select', multi_select: [] });
  });
});

describe('getNotionMultiSelectNames', () => {
  it('returns option names for multi_select', () => {
    const prop = {
      type: 'multi_select',
      multi_select: [{ name: 'user' }, { name: 'public' }],
    };
    expect(getNotionMultiSelectNames(prop)).toEqual(['user', 'public']);
  });

  it('returns empty for wrong type or empty', () => {
    expect(getNotionMultiSelectNames({ type: 'rich_text', rich_text: [] })).toEqual([]);
    expect(getNotionMultiSelectNames({ type: 'multi_select', multi_select: [] })).toEqual([]);
    expect(getNotionMultiSelectNames(undefined)).toEqual([]);
  });
});
