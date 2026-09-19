import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/storage/utils', () => ({
  getPrismaClient: vi.fn(),
}));

import { DocumentationSource } from '@/storage/client/client';
import { getPrismaClient } from '@/storage/utils';
import {
  type RepositoryDocUpsertInput,
  dbDocumentationUpsertRepository,
  isRepositoryDocUnchanged,
} from '@/storage/documentation/documentation.upsert-repository';

const input: RepositoryDocUpsertInput = {
  externalId: 'repo:authentication',
  isFaq: false,
  isPublic: false,
  format: 'markdown',
  audienceRoles: ['admin', 'technical'],
  tags: ['simulation_step_1'],
  translations: [
    { locale: 'en', title: 'Auth', content: 'Hello' },
    { locale: 'nl', title: 'Auth NL', content: 'Hallo' },
  ],
};

const existing = {
  isFaq: false,
  isPublic: false,
  format: 'markdown',
  audienceRoles: ['technical', 'admin'],
  tags: ['simulation_step_1'],
  translations: [
    { locale: 'nl', title: 'Auth NL', content: 'Hallo' },
    { locale: 'en', title: 'Auth', content: 'Hello' },
  ],
};

describe('isRepositoryDocUnchanged', () => {
  it('is true when metadata and translations match regardless of order', () => {
    expect(isRepositoryDocUnchanged(existing, input)).toBe(true);
  });

  it('is false when title or content changes', () => {
    expect(isRepositoryDocUnchanged(existing, { ...input, translations: [{ locale: 'en', title: 'Auth', content: 'Changed' }] })).toBe(false);
    expect(
      isRepositoryDocUnchanged(existing, {
        ...input,
        translations: [
          { locale: 'en', title: 'Changed', content: 'Hello' },
          { locale: 'nl', title: 'Auth NL', content: 'Hallo' },
        ],
      }),
    ).toBe(false);
  });

  it('is false when a locale is added or removed', () => {
    expect(isRepositoryDocUnchanged(existing, { ...input, translations: [input.translations[0]!] })).toBe(false);
    expect(
      isRepositoryDocUnchanged(existing, {
        ...input,
        translations: [...input.translations, { locale: 'fr', title: 'Auth FR', content: 'Bonjour' }],
      }),
    ).toBe(false);
  });

  it('is false when faq, public, format, roles, or tags change', () => {
    expect(isRepositoryDocUnchanged(existing, { ...input, isFaq: true })).toBe(false);
    expect(isRepositoryDocUnchanged(existing, { ...input, isPublic: true })).toBe(false);
    expect(isRepositoryDocUnchanged(existing, { ...input, format: 'text' })).toBe(false);
    expect(isRepositoryDocUnchanged(existing, { ...input, audienceRoles: ['admin'] })).toBe(false);
    expect(isRepositoryDocUnchanged(existing, { ...input, tags: [] })).toBe(false);
  });
});

describe('dbDocumentationUpsertRepository', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('creates when the article does not exist', async () => {
    const findUnique = vi.fn().mockResolvedValueOnce(null);
    const create = vi.fn().mockResolvedValueOnce({});
    const update = vi.fn();
    vi.mocked(getPrismaClient).mockReturnValue({
      documentation: { findUnique, create, update },
    } as never);

    await expect(dbDocumentationUpsertRepository(input)).resolves.toBe('created');
    expect(create).toHaveBeenCalledWith({
      data: {
        source: DocumentationSource.repository,
        externalId: input.externalId,
        isFaq: input.isFaq,
        isPublic: input.isPublic,
        format: input.format,
        audienceRoles: input.audienceRoles,
        tags: input.tags,
        translations: {
          createMany: {
            data: input.translations,
          },
        },
      },
    });
    expect(update).not.toHaveBeenCalled();
  });

  it('skips update when content and metadata are unchanged', async () => {
    const findUnique = vi.fn().mockResolvedValueOnce(existing);
    const create = vi.fn();
    const update = vi.fn();
    vi.mocked(getPrismaClient).mockReturnValue({
      documentation: { findUnique, create, update },
    } as never);

    await expect(dbDocumentationUpsertRepository(input)).resolves.toBe('unchanged');
    expect(create).not.toHaveBeenCalled();
    expect(update).not.toHaveBeenCalled();
  });

  it('updates when content changed', async () => {
    const findUnique = vi.fn().mockResolvedValueOnce(existing);
    const create = vi.fn();
    const update = vi.fn().mockResolvedValueOnce({});
    vi.mocked(getPrismaClient).mockReturnValue({
      documentation: { findUnique, create, update },
    } as never);

    const changed: RepositoryDocUpsertInput = {
      ...input,
      translations: [
        { locale: 'en', title: 'Auth', content: 'Updated' },
        { locale: 'nl', title: 'Auth NL', content: 'Hallo' },
      ],
    };

    await expect(dbDocumentationUpsertRepository(changed)).resolves.toBe('updated');
    expect(update).toHaveBeenCalledWith({
      where: { externalId: input.externalId },
      data: {
        isFaq: changed.isFaq,
        isPublic: changed.isPublic,
        format: changed.format,
        audienceRoles: changed.audienceRoles,
        tags: changed.tags,
        translations: {
          deleteMany: {},
          createMany: {
            data: changed.translations,
          },
        },
      },
    });
    expect(create).not.toHaveBeenCalled();
  });
});
