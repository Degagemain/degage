import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/storage/translation-override/translation-override.upsert', () => ({
  dbTranslationOverrideUpsert: vi.fn(),
}));

import { upsertTranslationOverride } from '@/actions/translation-override/upsert';
import { TranslationOverrideValidationError } from '@/actions/translation-override/validation';
import { dbTranslationOverrideUpsert } from '@/storage/translation-override/translation-override.upsert';

describe('upsertTranslationOverride', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('saves overrides that only reuse variables from the original message', async () => {
    const override = {
      key: 'language.nonDefaultLocaleNotice',
      locale: 'en' as const,
      value: 'Available in {language}.',
    };
    vi.mocked(dbTranslationOverrideUpsert).mockResolvedValueOnce({
      id: '550e8400-e29b-41d4-a716-446655440000',
      ...override,
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
      updatedAt: new Date('2026-01-01T00:00:00.000Z'),
    });

    await expect(upsertTranslationOverride(override)).resolves.toMatchObject(override);
    expect(dbTranslationOverrideUpsert).toHaveBeenCalledWith(override);
  });

  it('rejects overrides that introduce new variables', async () => {
    await expect(
      upsertTranslationOverride({
        key: 'language.nonDefaultLocaleNotice',
        locale: 'en',
        value: 'Available in {language} for {name}.',
      }),
    ).rejects.toBeInstanceOf(TranslationOverrideValidationError);
    expect(dbTranslationOverrideUpsert).not.toHaveBeenCalled();
  });

  it('rejects keys that are not string messages for the locale', async () => {
    await expect(
      upsertTranslationOverride({
        key: 'language',
        locale: 'en',
        value: 'Language',
      }),
    ).rejects.toBeInstanceOf(TranslationOverrideValidationError);
    expect(dbTranslationOverrideUpsert).not.toHaveBeenCalled();
  });
});
