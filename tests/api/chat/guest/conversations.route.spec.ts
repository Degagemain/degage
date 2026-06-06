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

import { readChatConversation } from '@/actions/conversation/read';
import { auth } from '@/auth';
import { GET } from '@/api/chat/guest/conversations/[id]/route';

describe('GET /api/chat/guest/conversations/[id]', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('returns conversation when guest token matches', async () => {
    vi.mocked(auth.api.getSession).mockResolvedValueOnce(null);
    vi.mocked(readChatConversation).mockResolvedValueOnce({
      id: '6eccebe4-069a-4292-8d89-1f40392b935d',
      userId: null,
      medium: 'frontend',
      emailThreadId: null,
      guestToken: 'guest-token-1',
      title: 'Hello',
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const request = {
      nextUrl: new URL('http://localhost/api/chat/guest/conversations/6eccebe4-069a-4292-8d89-1f40392b935d?guestToken=guest-token-1'),
    };
    const response = await GET(request as any, {
      params: Promise.resolve({ id: '6eccebe4-069a-4292-8d89-1f40392b935d' }),
    });
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toMatchObject({
      id: '6eccebe4-069a-4292-8d89-1f40392b935d',
      title: 'Hello',
    });
    expect(body.guestToken).toBeUndefined();
  });

  it('returns 404 when guest token is missing', async () => {
    vi.mocked(auth.api.getSession).mockResolvedValueOnce(null);

    const request = {
      nextUrl: new URL('http://localhost/api/chat/guest/conversations/6eccebe4-069a-4292-8d89-1f40392b935d'),
    };
    const response = await GET(request as any, {
      params: Promise.resolve({ id: '6eccebe4-069a-4292-8d89-1f40392b935d' }),
    });

    expect(response.status).toBe(404);
    expect(readChatConversation).not.toHaveBeenCalled();
  });
});
