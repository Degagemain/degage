import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/integrations/gemini', () => ({
  generateEmbedding: vi.fn(),
}));

vi.mock('@/storage/documentation-chunk/documentation-chunk.search', () => ({
  dbDocumentationChunkSearch: vi.fn(),
}));

vi.mock('@/context/request-context', () => ({
  getRequestContentLocale: vi.fn(),
}));

import { searchDocumentationForRag } from '@/actions/documentation/search-rag';
import { getRequestContentLocale } from '@/context/request-context';
import { generateEmbedding } from '@/integrations/gemini';
import { dbDocumentationChunkSearch } from '@/storage/documentation-chunk/documentation-chunk.search';

describe('searchDocumentationForRag', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('deduplicates citations by documentation id and applies locale/limit', async () => {
    vi.mocked(getRequestContentLocale).mockReturnValue('nl');
    vi.mocked(generateEmbedding).mockResolvedValueOnce([0.1, 0.2]);
    vi.mocked(dbDocumentationChunkSearch).mockResolvedValueOnce([
      {
        chunkId: 'c1',
        documentationId: 'd1',
        externalId: 'repo:first',
        title: 'First',
        content: 'A',
        similarity: 0.91,
      },
      {
        chunkId: 'c2',
        documentationId: 'd1',
        externalId: 'repo:first',
        title: 'First',
        content: 'B',
        similarity: 0.88,
      },
    ]);

    const result = await searchDocumentationForRag('test query', {
      viewerAudienceRole: 'user',
      limit: 5,
    });

    expect(dbDocumentationChunkSearch).toHaveBeenCalledWith([0.1, 0.2], {
      viewerAudienceRole: 'user',
      limit: 5,
      locale: 'nl',
    });
    expect(result.chunks).toHaveLength(2);
    expect(result.citations).toEqual([
      {
        documentationId: 'd1',
        externalId: 'repo:first',
        title: 'First',
        url: '/app/docs/repo%3Afirst',
      },
    ]);
    expect(result.noResults).toBe(false);
    expect(result.noResultsGuidance).toBeNull();
  });

  it('returns noResults guidance when no chunks are found', async () => {
    vi.mocked(getRequestContentLocale).mockReturnValue('en');
    vi.mocked(generateEmbedding).mockResolvedValueOnce([0.1, 0.2]);
    vi.mocked(dbDocumentationChunkSearch).mockResolvedValueOnce([]);

    const result = await searchDocumentationForRag('missing', {
      viewerAudienceRole: 'public',
    });

    expect(result.noResults).toBe(true);
    expect(result.citations).toEqual([]);
    expect(result.noResultsGuidance).toContain('No relevant documentation chunks were found');
  });
});
