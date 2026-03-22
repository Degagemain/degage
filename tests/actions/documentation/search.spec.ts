import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/storage/documentation/documentation.search', () => ({
  dbDocumentationSearch: vi.fn(),
}));

import { searchDocumentation } from '@/actions/documentation/search';
import { dbDocumentationSearch } from '@/storage/documentation/documentation.search';
import { documentationFilterSchema } from '@/domain/documentation.filter';

describe('searchDocumentation (API role → list filter)', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  const filter = documentationFilterSchema.parse({ isFaq: true });

  it('restricts to public-safe audiences when viewer is not admin', async () => {
    vi.mocked(dbDocumentationSearch).mockResolvedValueOnce({ records: [], total: 0 });
    await searchDocumentation(filter, false);
    expect(dbDocumentationSearch).toHaveBeenCalledWith(filter, { restrictToPublicAudiences: true });
  });

  it('does not restrict audiences when viewer is admin', async () => {
    vi.mocked(dbDocumentationSearch).mockResolvedValueOnce({ records: [], total: 0 });
    await searchDocumentation(filter, true);
    expect(dbDocumentationSearch).toHaveBeenCalledWith(filter, { restrictToPublicAudiences: false });
  });
});
