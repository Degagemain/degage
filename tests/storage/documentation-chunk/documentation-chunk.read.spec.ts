import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/storage/utils', () => ({
  getPrismaClient: vi.fn(),
}));

import { getPrismaClient } from '@/storage/utils';
import { dbDocumentationChunkReadHashesForDocumentation } from '@/storage/documentation-chunk/documentation-chunk.read';

describe('dbDocumentationChunkReadHashesForDocumentation', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('maps the latest content hash per locale', async () => {
    const queryRaw = vi.fn().mockResolvedValueOnce([
      { locale: 'en', contentHash: 'hash-en' },
      { locale: 'nl', contentHash: 'hash-nl' },
    ]);
    vi.mocked(getPrismaClient).mockReturnValue({ $queryRaw: queryRaw } as never);

    await expect(dbDocumentationChunkReadHashesForDocumentation('doc-1')).resolves.toEqual(
      new Map([
        ['en', 'hash-en'],
        ['nl', 'hash-nl'],
      ]),
    );
    expect(queryRaw).toHaveBeenCalledTimes(1);
  });
});
