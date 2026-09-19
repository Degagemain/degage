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

  it('uses public-only audiences when anonymous', async () => {
    vi.mocked(dbDocumentationSearch).mockResolvedValueOnce({ records: [], total: 0 });
    await searchDocumentation(filter, { isViewerAdmin: false, isAuthenticated: false });
    expect(dbDocumentationSearch).toHaveBeenCalledWith({ ...filter, audiences: ['public'] });
  });

  it('uses user and public for authenticated non-admin', async () => {
    vi.mocked(dbDocumentationSearch).mockResolvedValueOnce({ records: [], total: 0 });
    await searchDocumentation(filter, { isViewerAdmin: false, isAuthenticated: true });
    expect(dbDocumentationSearch).toHaveBeenCalledWith({ ...filter, audiences: ['user', 'public'] });
  });

  it('uses admin, user, and public for admin viewer', async () => {
    vi.mocked(dbDocumentationSearch).mockResolvedValueOnce({ records: [], total: 0 });
    await searchDocumentation(filter, { isViewerAdmin: true, isAuthenticated: true });
    expect(dbDocumentationSearch).toHaveBeenCalledWith({ ...filter, audiences: ['admin', 'user', 'public'] });
  });

  it('narrows to requested audiences that the viewer may see', async () => {
    vi.mocked(dbDocumentationSearch).mockResolvedValueOnce({ records: [], total: 0 });
    const adminFilter = documentationFilterSchema.parse({ audiences: ['admin'] });
    await searchDocumentation(adminFilter, { isViewerAdmin: true, isAuthenticated: true });
    expect(dbDocumentationSearch).toHaveBeenCalledWith({ ...adminFilter, audiences: ['admin'] });
  });

  it('returns no records when requested audiences are not visible to the viewer', async () => {
    const userFilter = documentationFilterSchema.parse({ audiences: ['admin'] });
    const result = await searchDocumentation(userFilter, { isViewerAdmin: false, isAuthenticated: true });
    expect(result).toEqual({ records: [], total: 0 });
    expect(dbDocumentationSearch).not.toHaveBeenCalled();
  });
});
