import { describe, expect, it } from 'vitest';
import { applyMessageOverrides, buildTranslationCatalog, extractTemplateVariables, validateOverrideVariables } from '@/i18n/message-utils';

describe('message utils', () => {
  it('applies dot-path overrides without removing existing messages', () => {
    const messages = {
      admin: {
        users: {
          title: 'Users',
          empty: 'No users',
        },
      },
    };

    expect(applyMessageOverrides(messages, [{ key: 'admin.users.title', locale: 'en', value: 'Members' }])).toEqual({
      admin: {
        users: {
          title: 'Members',
          empty: 'No users',
        },
      },
    });
  });

  it('collects catalog leaves across locales', () => {
    const catalog = buildTranslationCatalog({
      en: { admin: { users: { title: 'Users' } } },
      nl: { admin: { users: { title: 'Gebruikers' } } },
      fr: { admin: { users: { title: 'Utilisateurs' } } },
    });

    expect(catalog).toEqual([
      {
        key: 'admin.users.title',
        segments: ['admin', 'users', 'title'],
        values: {
          en: 'Users',
          nl: 'Gebruikers',
          fr: 'Utilisateurs',
        },
        variables: {
          en: [],
          nl: [],
          fr: [],
        },
      },
    ]);
  });

  it('rejects new template variables while allowing original variables', () => {
    expect(extractTemplateVariables('Hello {name}, use {code}.')).toEqual(['code', 'name']);
    expect(validateOverrideVariables('Hello {name}', 'Hi {name}')).toEqual([]);
    expect(validateOverrideVariables('Hello {name}', 'Hi {firstName}')).toEqual(['firstName']);
  });
});
