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

vi.mock('@/actions/conversation/message/create', () => ({
  createMessage: vi.fn(),
}));

import { POST } from '@/api/chat/conversations/[id]/messages/route';
import { createMessage } from '@/actions/conversation/message/create';
import { readChatConversation } from '@/actions/conversation/read';
import { auth } from '@/auth';
import { chatUserMessageMaxLength } from '@/domain/chat.model';

describe('POST /api/chat/conversations/[id]/messages', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  const context = { params: Promise.resolve({ id: '8d65ad66-faea-4b2f-a627-c23e7359af4c' }) } as any;

  it('returns 401 for unauthenticated users', async () => {
    vi.mocked(auth.api.getSession).mockResolvedValue(null);
    const request = new Request('http://localhost/api/chat/conversations/x/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role: 'assistant', content: 'hello' }),
    });

    const response = await POST(request as any, context);
    expect(response.status).toBe(401);
    expect(createMessage).not.toHaveBeenCalled();
  });

  it('returns 404 when conversation does not exist or is inaccessible', async () => {
    vi.mocked(auth.api.getSession).mockResolvedValue({ user: { id: 'user-1', role: 'user' } } as any);
    vi.mocked(readChatConversation).mockResolvedValueOnce(null);

    const request = new Request('http://localhost/api/chat/conversations/x/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role: 'assistant', content: 'hello' }),
    });

    const response = await POST(request as any, context);
    expect(response.status).toBe(404);
    expect(createMessage).not.toHaveBeenCalled();
  });

  it('returns 400 when content exceeds max length', async () => {
    vi.mocked(auth.api.getSession).mockResolvedValue({ user: { id: 'user-1', role: 'user' } } as any);
    vi.mocked(readChatConversation).mockResolvedValueOnce({
      id: '8d65ad66-faea-4b2f-a627-c23e7359af4c',
      userId: 'user-1',
      title: '',
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const request = new Request('http://localhost/api/chat/conversations/x/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role: 'assistant', content: 'x'.repeat(chatUserMessageMaxLength + 1) }),
    });

    const response = await POST(request as any, context);
    expect(response.status).toBe(400);
    expect(createMessage).not.toHaveBeenCalled();
  });
});
