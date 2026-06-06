import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/auth', () => ({
  auth: { api: { getSession: vi.fn() } },
}));

vi.mock('@/actions/conversation/admin-search', () => ({
  searchChatConversationsForAdmin: vi.fn(),
}));

vi.mock('next/headers', () => ({
  headers: vi.fn().mockResolvedValue(new Headers()),
  cookies: vi.fn().mockResolvedValue({ get: () => undefined }),
}));

import { GET } from '@/api/admin/chat-conversations/route';
import { auth } from '@/auth';
import { searchChatConversationsForAdmin } from '@/actions/conversation/admin-search';

const adminUser = { id: 'admin-id', name: 'Admin', email: 'a@example.com', role: 'admin', banned: false };
const regularUser = { id: 'user-id', name: 'User', email: 'u@example.com', role: 'user', banned: false };

const makeRequest = (path = 'http://localhost/api/admin/chat-conversations') => ({ nextUrl: new URL(path) }) as any;

describe('API Route - GET /api/admin/chat-conversations', () => {
  afterEach(() => vi.clearAllMocks());

  it('returns 401 when unauthenticated', async () => {
    vi.mocked(auth.api.getSession).mockResolvedValueOnce(null);
    const response = await GET(makeRequest());
    expect(response.status).toBe(401);
    expect(searchChatConversationsForAdmin).not.toHaveBeenCalled();
  });

  it('returns 403 when authenticated as a regular user', async () => {
    vi.mocked(auth.api.getSession).mockResolvedValueOnce({ user: regularUser } as any);
    const response = await GET(makeRequest());
    expect(response.status).toBe(403);
    expect(searchChatConversationsForAdmin).not.toHaveBeenCalled();
  });

  it('returns 200 when authenticated as admin', async () => {
    vi.mocked(auth.api.getSession).mockResolvedValueOnce({ user: adminUser } as any);
    vi.mocked(searchChatConversationsForAdmin).mockResolvedValueOnce({ records: [], total: 0 });
    const response = await GET(makeRequest());
    expect(response.status).toBe(200);
    expect(searchChatConversationsForAdmin).toHaveBeenCalledTimes(1);
  });
});
