import { afterEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';

vi.mock('@/auth', () => ({
  auth: {
    api: {
      getSession: vi.fn(),
    },
  },
}));

vi.mock('next/headers', () => ({
  headers: vi.fn().mockResolvedValue(new Headers()),
  cookies: vi.fn().mockResolvedValue({ get: () => undefined }),
}));

vi.mock('@/actions/conversation/search-admin', () => ({
  searchAdminChatConversations: vi.fn(),
}));

import { GET } from '@/api/admin/chat-conversations/route';
import { searchAdminChatConversations } from '@/actions/conversation/search-admin';
import { auth } from '@/auth';

const makeRequest = (url = 'http://localhost/api/admin/chat-conversations') => new NextRequest(url);

describe('GET /api/admin/chat-conversations', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('returns 401 when unauthenticated', async () => {
    vi.mocked(auth.api.getSession).mockResolvedValueOnce(null);

    const response = await GET(makeRequest(), undefined);

    expect(response.status).toBe(401);
    expect(searchAdminChatConversations).not.toHaveBeenCalled();
  });

  it('returns 403 for non-admin users', async () => {
    vi.mocked(auth.api.getSession).mockResolvedValueOnce({ user: { id: 'user-1', role: 'user' } } as any);

    const response = await GET(makeRequest(), undefined);

    expect(response.status).toBe(403);
    expect(searchAdminChatConversations).not.toHaveBeenCalled();
  });

  it('returns admin chat conversation rows for admins', async () => {
    vi.mocked(auth.api.getSession).mockResolvedValueOnce({ user: { id: 'admin-1', role: 'admin' } } as any);
    vi.mocked(searchAdminChatConversations).mockResolvedValueOnce({
      records: [
        {
          id: 'b707a220-0f32-4ffe-951a-52a0700850c8',
          title: 'Billing question',
          user: { id: 'user-1', name: 'Jane Doe', email: 'jane@example.com' },
          createdAt: new Date('2026-01-01T00:00:00Z'),
          updatedAt: new Date('2026-01-02T00:00:00Z'),
        },
      ],
      total: 1,
    });

    const response = await GET(
      makeRequest('http://localhost/api/admin/chat-conversations?query=billing&userIds=user-1&skip=10&take=5'),
      undefined,
    );
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(searchAdminChatConversations).toHaveBeenCalledWith({
      query: 'billing',
      userIds: ['user-1'],
      skip: 10,
      take: 5,
      sortBy: 'updatedAt',
      sortOrder: 'desc',
    });
    expect(json.total).toBe(1);
    expect(json.records[0].title).toBe('Billing question');
    expect(json.records[0]).not.toHaveProperty('messages');
  });

  it('returns 400 for invalid query parameters', async () => {
    vi.mocked(auth.api.getSession).mockResolvedValueOnce({ user: { id: 'admin-1', role: 'admin' } } as any);

    const response = await GET(makeRequest('http://localhost/api/admin/chat-conversations?take=1000'), undefined);

    expect(response.status).toBe(400);
    expect(searchAdminChatConversations).not.toHaveBeenCalled();
  });
});
