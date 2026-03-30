import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/integrations/gemini', () => ({
  generateEmbedding: vi.fn(),
}));

vi.mock('@/storage/documentation-chunk/documentation-chunk.search', () => ({
  dbDocumentationChunkSearch: vi.fn(),
}));

vi.mock('@/storage/documentation/documentation.translations-for-rag', () => ({
  dbDocumentationTranslationsForRagPairs: vi.fn(),
}));

vi.mock('@/context/request-context', () => ({
  getRequestContentLocale: vi.fn(),
}));

import { searchDocumentationForRag } from '@/actions/documentation/search-rag';
import { getRequestContentLocale } from '@/context/request-context';
import { generateEmbedding } from '@/integrations/gemini';
import { dbDocumentationChunkSearch } from '@/storage/documentation-chunk/documentation-chunk.search';
import { dbDocumentationTranslationsForRagPairs } from '@/storage/documentation/documentation.translations-for-rag';

describe('searchDocumentationForRag', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('groups chunks by document, loads full translations, and deduplicates citations', async () => {
    vi.mocked(getRequestContentLocale).mockReturnValue('nl');
    vi.mocked(generateEmbedding).mockResolvedValueOnce([0.1, 0.2]);
    vi.mocked(dbDocumentationChunkSearch).mockResolvedValueOnce([
      {
        chunkId: 'c1',
        documentationId: 'd1',
        externalId: 'repo:first',
        title: 'First',
        content: 'A',
        locale: 'nl',
        similarity: 0.91,
      },
      {
        chunkId: 'c2',
        documentationId: 'd1',
        externalId: 'repo:first',
        title: 'First',
        content: 'B',
        locale: 'nl',
        similarity: 0.88,
      },
    ]);
    vi.mocked(dbDocumentationTranslationsForRagPairs).mockResolvedValueOnce(
      new Map([
        [
          'd1',
          {
            documentationId: 'd1',
            locale: 'nl',
            title: 'First',
            content: 'Full article text for the page.',
          },
        ],
      ]),
    );

    const result = await searchDocumentationForRag('test query', {
      viewerAudienceRole: 'user',
      limit: 5,
    });

    expect(dbDocumentationChunkSearch).toHaveBeenCalledWith([0.1, 0.2], {
      viewerAudienceRole: 'user',
      limit: 5,
      locales: ['nl'],
    });
    expect(dbDocumentationTranslationsForRagPairs).toHaveBeenCalledWith([{ documentationId: 'd1', locale: 'nl' }]);
    expect(result.fullDocuments).toHaveLength(1);
    expect(result.fullDocuments[0]).toMatchObject({
      documentationId: 'd1',
      externalId: 'repo:first',
      locale: 'nl',
      title: 'First',
      content: 'Full article text for the page.',
      bestChunkSimilarity: 0.91,
    });
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

    expect(dbDocumentationTranslationsForRagPairs).not.toHaveBeenCalled();
    expect(result.noResults).toBe(true);
    expect(result.citations).toEqual([]);
    expect(result.noResultsGuidance).toContain('No relevant documentation chunks were found');
  });

  it('ranks documents by best chunk and returns up to maxFullDocuments', async () => {
    vi.mocked(getRequestContentLocale).mockReturnValue('en');
    vi.mocked(generateEmbedding).mockResolvedValueOnce([0.1, 0.2]);
    vi.mocked(dbDocumentationChunkSearch).mockResolvedValueOnce([
      {
        chunkId: 'c1',
        documentationId: 'd-low',
        externalId: 'repo:low',
        title: 'Low',
        content: 'x',
        locale: 'en',
        similarity: 0.5,
      },
      {
        chunkId: 'c2',
        documentationId: 'd-high',
        externalId: 'repo:high',
        title: 'High',
        content: 'y',
        locale: 'en',
        similarity: 0.99,
      },
    ]);
    vi.mocked(dbDocumentationTranslationsForRagPairs).mockResolvedValueOnce(
      new Map([
        ['d-high', { documentationId: 'd-high', locale: 'en', title: 'High', content: 'H full' }],
        ['d-low', { documentationId: 'd-low', locale: 'en', title: 'Low', content: 'L full' }],
      ]),
    );

    const result = await searchDocumentationForRag('q', {
      viewerAudienceRole: 'public',
      maxFullDocuments: 5,
    });

    expect(result.fullDocuments.map((d) => d.documentationId)).toEqual(['d-high', 'd-low']);
    expect(result.fullDocuments[0]?.bestChunkSimilarity).toBe(0.99);
  });
});
