import { afterEach, describe, expect, it, vi } from 'vitest';
import { Role } from '@/domain/role.model';
import { canUseMcpTools } from '@/mcp/auth-context';

vi.mock('@/actions/documentation/search', () => ({
  searchDocumentation: vi.fn(),
}));

import { searchDocumentation } from '@/actions/documentation/search';

describe('search_documentation gate', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('uses documentation search with GET-aligned filters when gate passes', async () => {
    vi.mocked(searchDocumentation).mockResolvedValueOnce({
      records: [],
      total: 0,
    });

    const ctx = {
      userId: 'user-1',
      role: Role.USER,
      emailVerified: true,
      banned: false,
      scopes: ['mcp:user'],
      clientId: 'client-1',
    };

    expect(canUseMcpTools(ctx, 'mcp:user').ok).toBe(true);
    await searchDocumentation(
      {
        query: 'battery',
        isFaq: true,
        isPublic: true,
        sources: ['manual'],
        tags: undefined,
        formats: undefined,
        groupIds: undefined,
        skip: 0,
        take: 10,
        sortBy: 'updatedAt',
        sortOrder: 'desc',
        audiences: undefined,
      },
      { isViewerAdmin: false, isAuthenticated: true },
    );
    expect(searchDocumentation).toHaveBeenCalledWith(
      expect.objectContaining({ query: 'battery', isFaq: true, isPublic: true, take: 10, sources: ['manual'] }),
      {
        isViewerAdmin: false,
        isAuthenticated: true,
      },
    );
  });
});
