import { afterEach, describe, expect, it, vi } from 'vitest';

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

vi.mock('@/actions/conversation/read', () => ({
  readChatConversation: vi.fn(),
}));

import { GET } from '@/api/admin/chat-conversations/[id]/route';
import { readChatConversation } from '@/actions/conversation/read';
import { auth } from '@/auth';

const context = { params: Promise.resolve({ id: '8d65ad66-faea-4b2f-a627-c23e7359af4c' }) } as any;

describe('GET /api/admin/chat-conversations/[id]', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('returns 401 when unauthenticated', async () => {
    vi.mocked(auth.api.getSession).mockResolvedValueOnce(null);

    const response = await GET(new Request('http://localhost/api/admin/chat-conversations/id') as any, context);

    expect(response.status).toBe(401);
    expect(readChatConversation).not.toHaveBeenCalled();
  });

  it('returns 403 for non-admin users', async () => {
    vi.mocked(auth.api.getSession).mockResolvedValueOnce({ user: { id: 'user-1', role: 'user' } } as any);

    const response = await GET(new Request('http://localhost/api/admin/chat-conversations/id') as any, context);

    expect(response.status).toBe(403);
    expect(readChatConversation).not.toHaveBeenCalled();
  });

  it('returns the full chat conversation for admins', async () => {
    const admin = { id: 'admin-1', role: 'admin' };
    vi.mocked(auth.api.getSession).mockResolvedValueOnce({ user: admin } as any);
    vi.mocked(readChatConversation).mockResolvedValueOnce({
      id: '8d65ad66-faea-4b2f-a627-c23e7359af4c',
      userId: null,
      medium: 'frontend',
      emailThreadId: null,
      title: 'Debug chat',
      messages: [
        {
          id: '5d460d19-ec81-4f40-9bc5-f95debf5e5c5',
          conversationId: '8d65ad66-faea-4b2f-a627-c23e7359af4c',
          externalId: null,
          externalMessageId: null,
          role: 'assistant',
          content: 'Answer',
          citations: [{ title: 'FAQ article', url: '/app/admin/documentation/foo' }],
          createdAt: new Date('2026-01-02T00:00:00Z'),
        },
      ],
      createdAt: new Date('2026-01-01T00:00:00Z'),
      updatedAt: new Date('2026-01-02T00:00:00Z'),
    });

    const response = await GET(new Request('http://localhost/api/admin/chat-conversations/id') as any, context);
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(readChatConversation).toHaveBeenCalledWith('8d65ad66-faea-4b2f-a627-c23e7359af4c', admin);
    expect(json.messages).toHaveLength(1);
    expect(json.messages[0].citations[0].title).toBe('FAQ article');
  });

  it('returns 404 when the conversation is missing', async () => {
    vi.mocked(auth.api.getSession).mockResolvedValueOnce({ user: { id: 'admin-1', role: 'admin' } } as any);
    vi.mocked(readChatConversation).mockResolvedValueOnce(null);

    const response = await GET(new Request('http://localhost/api/admin/chat-conversations/id') as any, context);

    expect(response.status).toBe(404);
  });
});
