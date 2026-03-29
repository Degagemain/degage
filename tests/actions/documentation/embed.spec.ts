import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/storage/documentation/documentation.search', () => ({
  dbDocumentationSearch: vi.fn(),
}));

vi.mock('@/storage/documentation-chunk/documentation-chunk.read', () => ({
  dbDocumentationChunkReadHashesByLocale: vi.fn(),
}));

vi.mock('@/storage/documentation-chunk/documentation-chunk.upsert', () => ({
  dbDocumentationChunkReplaceForLocale: vi.fn(),
}));

vi.mock('@/integrations/gemini', () => ({
  generateEmbedding: vi.fn(),
}));

import { syncDocumentationEmbeddings } from '@/actions/documentation/embed';
import { generateEmbedding } from '@/integrations/gemini';
import { dbDocumentationChunkReadHashesByLocale } from '@/storage/documentation-chunk/documentation-chunk.read';
import { dbDocumentationChunkReplaceForLocale } from '@/storage/documentation-chunk/documentation-chunk.upsert';
import { dbDocumentationSearch } from '@/storage/documentation/documentation.search';
import { documentation } from '../../builders/documentation.builder';

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
    vi.mocked(dbDocumentationChunkReadHashesByLocale).mockResolvedValueOnce(new Map());

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
});
