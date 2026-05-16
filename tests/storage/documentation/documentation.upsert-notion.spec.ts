import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/storage/utils', () => ({
  getPrismaClient: vi.fn(),
}));

import { getPrismaClient } from '@/storage/utils';
import { dbDocumentationUpsertNotion, notionExternalId } from '@/storage/documentation/documentation.upsert-notion';

const prisma = {
  documentation: {
    findUnique: vi.fn(),
    create: vi.fn(),
  },
  documentationTranslation: {
    upsert: vi.fn(),
  },
};

afterEach(() => {
  vi.clearAllMocks();
});

describe('notionExternalId', () => {
  it('prefixes parent keys once', () => {
    expect(notionExternalId('getting-started')).toBe('notion:getting-started');
    expect(notionExternalId('notion:getting-started')).toBe('notion:getting-started');
  });
});

describe('dbDocumentationUpsertNotion', () => {
  it('creates a notion documentation entry with one markdown translation and default doc-level fields', async () => {
    vi.mocked(getPrismaClient).mockReturnValue(prisma as never);
    prisma.documentation.findUnique.mockResolvedValueOnce(null);

    await dbDocumentationUpsertNotion({
      parentKey: 'getting-started',
      translation: {
        locale: 'en',
        title: 'Getting started',
        content: '# Intro',
      },
    });

    expect(prisma.documentation.create).toHaveBeenCalledWith({
      data: {
        source: 'notion',
        externalId: 'notion:getting-started',
        isFaq: false,
        isPublic: false,
        format: 'markdown',
        audienceRoles: [],
        tags: [],
        translations: {
          create: {
            locale: 'en',
            title: 'Getting started',
            content: '# Intro',
          },
        },
      },
    });
    expect(prisma.documentationTranslation.upsert).not.toHaveBeenCalled();
  });

  it('updates only the incoming locale translation for an existing documentation entry', async () => {
    vi.mocked(getPrismaClient).mockReturnValue(prisma as never);
    prisma.documentation.findUnique.mockResolvedValueOnce({ id: 'doc-id' });

    await dbDocumentationUpsertNotion({
      parentKey: 'getting-started',
      translation: {
        locale: 'nl',
        title: 'Starten',
        content: 'Welkom',
      },
    });

    expect(prisma.documentation.create).not.toHaveBeenCalled();
    expect(prisma.documentationTranslation.upsert).toHaveBeenCalledWith({
      where: {
        documentationId_locale: {
          documentationId: 'doc-id',
          locale: 'nl',
        },
      },
      create: {
        documentationId: 'doc-id',
        locale: 'nl',
        title: 'Starten',
        content: 'Welkom',
      },
      update: {
        title: 'Starten',
        content: 'Welkom',
      },
    });
  });
});
