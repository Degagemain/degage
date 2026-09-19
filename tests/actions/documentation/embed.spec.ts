import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/storage/documentation/documentation.search', () => ({
  dbDocumentationSearch: vi.fn(),
}));

vi.mock('@/storage/documentation/documentation.read', () => ({
  dbDocumentationRead: vi.fn(),
}));

vi.mock('@/storage/documentation-chunk/documentation-chunk.read', () => ({
  dbDocumentationChunkReadHashesByLocale: vi.fn(),
  dbDocumentationChunkReadHashesForDocumentation: vi.fn(),
}));

vi.mock('@/storage/documentation-chunk/documentation-chunk.upsert', () => ({
  dbDocumentationChunkReplaceForLocale: vi.fn(),
}));

vi.mock('@/integrations/gemini', () => ({
  generateEmbedding: vi.fn(),
}));

import { embedDocumentationById, syncDocumentationEmbeddings } from '@/actions/documentation/embed';
import { generateEmbedding } from '@/integrations/gemini';
import { dbDocumentationRead } from '@/storage/documentation/documentation.read';
import {
  dbDocumentationChunkReadHashesByLocale,
  dbDocumentationChunkReadHashesForDocumentation,
} from '@/storage/documentation-chunk/documentation-chunk.read';
import { dbDocumentationChunkReplaceForLocale } from '@/storage/documentation-chunk/documentation-chunk.upsert';
import { dbDocumentationSearch } from '@/storage/documentation/documentation.search';
import { sha256Hex } from '@/storage/utils';
import { documentation } from '../../builders/documentation.builder';

const contentHashFor = (title: string, content: string): string => sha256Hex(`${title.trim()}\n${content.trim()}`);

describe('syncDocumentationEmbeddings', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('counts records with missing ids as failed and skips embedding/upsert', async () => {
    vi.mocked(dbDocumentationSearch)
      .mockResolvedValueOnce({ records: [], total: 1 })
      .mockResolvedValueOnce({
        records: [documentation({ id: null, translations: [{ locale: 'nl', title: 'Title', content: 'Body' }] })],
        total: 1,
      });
    vi.mocked(dbDocumentationChunkReadHashesByLocale).mockResolvedValue(new Map());

    const result = await syncDocumentationEmbeddings();

    expect(result).toEqual({
      totalDocumentation: 1,
      updatedDocumentation: 0,
      skippedDocumentation: 0,
      failedDocumentation: 1,
    });
    expect(generateEmbedding).not.toHaveBeenCalled();
    expect(dbDocumentationChunkReplaceForLocale).not.toHaveBeenCalled();
  });

  it('skips locales whose content hash is unchanged', async () => {
    const doc = documentation({
      translations: [{ locale: 'nl', title: 'Title', content: 'Body' }],
    });
    vi.mocked(dbDocumentationSearch)
      .mockResolvedValueOnce({ records: [], total: 1 })
      .mockResolvedValueOnce({ records: [doc], total: 1 });
    vi.mocked(dbDocumentationChunkReadHashesByLocale).mockImplementation(async (locale) => {
      if (locale === 'nl') {
        return new Map([[doc.id!, contentHashFor('Title', 'Body')]]);
      }
      return new Map();
    });

    const result = await syncDocumentationEmbeddings();

    expect(result).toEqual({
      totalDocumentation: 1,
      updatedDocumentation: 0,
      skippedDocumentation: 3,
      failedDocumentation: 0,
    });
    expect(generateEmbedding).not.toHaveBeenCalled();
    expect(dbDocumentationChunkReplaceForLocale).not.toHaveBeenCalled();
  });
});

describe('embedDocumentationById', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('skips locales whose content hash is unchanged', async () => {
    const doc = documentation({
      translations: [
        { locale: 'en', title: 'Test EN', content: 'Body EN' },
        { locale: 'nl', title: 'Test NL', content: 'Body NL' },
        { locale: 'fr', title: 'Test FR', content: 'Body FR' },
      ],
    });
    vi.mocked(dbDocumentationRead).mockResolvedValueOnce(doc);
    vi.mocked(dbDocumentationChunkReadHashesForDocumentation).mockResolvedValueOnce(
      new Map([
        ['en', contentHashFor('Test EN', 'Body EN')],
        ['nl', contentHashFor('Test NL', 'Body NL')],
        ['fr', contentHashFor('Test FR', 'Body FR')],
      ]),
    );

    await embedDocumentationById(doc.id!);

    expect(generateEmbedding).not.toHaveBeenCalled();
    expect(dbDocumentationChunkReplaceForLocale).not.toHaveBeenCalled();
  });

  it('embeds locales with a missing or different hash', async () => {
    const doc = documentation({
      translations: [
        { locale: 'en', title: 'Test EN', content: 'Body EN' },
        { locale: 'nl', title: 'Test NL', content: 'Body NL' },
      ],
    });
    vi.mocked(dbDocumentationRead).mockResolvedValueOnce(doc);
    vi.mocked(dbDocumentationChunkReadHashesForDocumentation).mockResolvedValueOnce(new Map([['en', contentHashFor('Test EN', 'Body EN')]]));
    vi.mocked(generateEmbedding).mockResolvedValue([0.1, 0.2]);
    vi.mocked(dbDocumentationChunkReplaceForLocale).mockResolvedValue();

    await embedDocumentationById(doc.id!);

    expect(generateEmbedding).toHaveBeenCalled();
    expect(dbDocumentationChunkReplaceForLocale).toHaveBeenCalledTimes(1);
    expect(dbDocumentationChunkReplaceForLocale).toHaveBeenCalledWith(doc.id, 'nl', expect.any(Array));
  });
});
