import { describe, expect, it, vi } from 'vitest';

const { readFile } = vi.hoisted(() => ({
  readFile: vi.fn(async (path: string) => {
    if (path.endsWith('en.json')) return '{\n  "admin": {\n    "users": {\n      "title": "Users"\n    }\n  }\n}\n';
    if (path.endsWith('nl.json')) return '{\n  "admin": {\n    "users": {\n      "title": "Gebruikers"\n    }\n  }\n}\n';
    return '{\n  "admin": {\n    "users": {\n      "title": "Utilisateurs"\n    }\n  }\n}\n';
  }),
}));

vi.mock('node:fs/promises', () => ({
  readFile,
  default: {
    readFile,
  },
}));

vi.mock('@/actions/translation-override/list', () => ({
  listTranslationOverrides: vi.fn(async () => [
    {
      id: '550e8400-e29b-41d4-a716-446655440000',
      key: 'admin.users.title',
      locale: 'en',
      value: 'Members',
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
      updatedAt: new Date('2026-01-01T00:00:00.000Z'),
    },
    {
      id: '550e8400-e29b-41d4-a716-446655440001',
      key: 'admin.users.missing',
      locale: 'en',
      value: 'Missing',
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
      updatedAt: new Date('2026-01-01T00:00:00.000Z'),
    },
  ]),
}));

import { generateTranslationOverridePatch } from '@/actions/translation-override/generate-patch';

describe('generateTranslationOverridePatch', () => {
  it('generates a unified diff for valid overrides only', async () => {
    const patch = await generateTranslationOverridePatch();

    expect(patch).toContain('diff --git a/messages/en.json b/messages/en.json');
    expect(patch).toContain('-      "title": "Users"');
    expect(patch).toContain('+      "title": "Members"');
    expect(patch).not.toContain('Missing');
    expect(patch).not.toContain('messages/nl.json');
  });
});
