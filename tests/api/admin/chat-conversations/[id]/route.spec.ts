import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/auth', () => ({
  auth: { api: { getSession: vi.fn() } },
}));

vi.mock('@/actions/conversation/admin-read', () => ({
  readChatConversationForAdmin: vi.fn(),
}));

vi.mock('next/headers', () => ({
  headers: vi.fn().mockResolvedValue(new Headers()),
  cookies: vi.fn().mockResolvedValue({ get: () => undefined }),
}));

import { GET } from '@/api/admin/chat-conversations/[id]/route';
import { auth } from '@/auth';
import { readChatConversationForAdmin } from '@/actions/conversation/admin-read';

const adminUser = { id: 'admin-id', name: 'Admin', email: 'a@example.com', role: 'admin', banned: false };
const regularUser = { id: 'user-id', name: 'User', email: 'u@example.com', role: 'user', banned: false };

const makeContext = (id: string) => ({ params: Promise.resolve({ id }) });

describe('API Route - GET /api/admin/chat-conversations/[id]', () => {
  afterEach(() => vi.clearAllMocks());

  it('returns 401 when unauthenticated', async () => {
    vi.mocked(auth.api.getSession).mockResolvedValueOnce(null);
    const response = await GET({} as any, makeContext('conv-1'));
    expect(response.status).toBe(401);
    expect(readChatConversationForAdmin).not.toHaveBeenCalled();
  });

  it('returns 403 when authenticated as a regular user', async () => {
    vi.mocked(auth.api.getSession).mockResolvedValueOnce({ user: regularUser } as any);
    const response = await GET({} as any, makeContext('conv-1'));
    expect(response.status).toBe(403);
    expect(readChatConversationForAdmin).not.toHaveBeenCalled();
  });

  it('returns 404 when conversation is missing', async () => {
    vi.mocked(auth.api.getSession).mockResolvedValueOnce({ user: adminUser } as any);
    vi.mocked(readChatConversationForAdmin).mockResolvedValueOnce(null);
    const response = await GET({} as any, makeContext('conv-1'));
    expect(response.status).toBe(404);
  });

  it('returns conversation without guest token when admin', async () => {
    vi.mocked(auth.api.getSession).mockResolvedValueOnce({ user: adminUser } as any);
    vi.mocked(readChatConversationForAdmin).mockResolvedValueOnce({
      id: 'conv-1',
      title: 'Help',
      medium: 'frontend',
      emailThreadId: null,
      messages: [],
      user: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    const response = await GET({} as any, makeContext('conv-1'));
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.guestToken).toBeUndefined();
    expect(body.id).toBe('conv-1');
  });
});
