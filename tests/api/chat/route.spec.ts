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

vi.mock('@/actions/conversation/create', () => ({
  createChatConversation: vi.fn(),
}));

vi.mock('@/actions/conversation/read', () => ({
  readChatConversation: vi.fn(),
}));

vi.mock('@/actions/conversation/update', () => ({
  updateChatConversation: vi.fn(),
}));

vi.mock('@/actions/conversation/message/create', () => ({
  createMessage: vi.fn(),
}));

vi.mock('@/actions/support/generate-reply', () => ({
  generateSupportReplyStream: vi.fn(),
}));

import { createChatConversation } from '@/actions/conversation/create';
import { createMessage } from '@/actions/conversation/message/create';
import { readChatConversation } from '@/actions/conversation/read';
import { generateSupportReplyStream } from '@/actions/support/generate-reply';
import { auth } from '@/auth';
import { POST } from '@/api/chat/route';

describe('POST /api/chat', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('persists assistant output when streaming completes', async () => {
    vi.mocked(auth.api.getSession).mockResolvedValue({
      user: { id: 'user-1', role: 'user', locale: 'en' },
    } as any);
    vi.mocked(readChatConversation).mockResolvedValueOnce(null);
    vi.mocked(createChatConversation).mockResolvedValueOnce({
      id: '6eccebe4-069a-4292-8d89-1f40392b935d',
      userId: 'user-1',
      medium: 'frontend',
      emailThreadId: null,
      title: '',
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    vi.mocked(generateSupportReplyStream).mockImplementationOnce(async (_messages: any, options: any) => {
      await options.onFinish?.({ text: 'assistant answer', citations: [] });
      return {
        result: {
          toUIMessageStreamResponse: vi.fn().mockReturnValue(new Response('ok')),
        } as any,
        getLatestCitations: () => [],
      };
    });

    const request = new Request('http://localhost/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: [
          {
            id: 'u1',
            role: 'user',
            parts: [{ type: 'text', text: 'Hello' }],
          },
        ],
      }),
    });

    const response = await POST(request as any);
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(response.status).toBe(200);
    expect(createMessage).toHaveBeenCalled();
    expect(vi.mocked(createMessage).mock.calls.some(([input]) => input.role === 'assistant' && input.content === 'assistant answer')).toBe(
      true,
    );
  });

  it('passes audienceOverride to generateSupportReplyStream when admin sends previewAudience', async () => {
    vi.mocked(auth.api.getSession).mockResolvedValue({
      user: { id: 'admin-1', role: 'admin', locale: 'en' },
    } as any);
    vi.mocked(readChatConversation).mockResolvedValueOnce(null);
    vi.mocked(createChatConversation).mockResolvedValueOnce({
      id: '6eccebe4-069a-4292-8d89-1f40392b935d',
      userId: 'admin-1',
      medium: 'frontend',
      emailThreadId: null,
      title: '',
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    vi.mocked(generateSupportReplyStream).mockImplementationOnce(async () => ({
      result: {
        toUIMessageStreamResponse: vi.fn().mockReturnValue(new Response('ok')),
      } as any,
      getLatestCitations: () => [],
    }));

    const request = new Request('http://localhost/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: [
          {
            id: 'u1',
            role: 'user',
            parts: [{ type: 'text', text: 'Hello' }],
          },
        ],
        previewAudience: 'user',
      }),
    });

    const response = await POST(request as any);
    expect(response.status).toBe(200);
    expect(vi.mocked(generateSupportReplyStream).mock.calls[0]?.[1]).toMatchObject({ audienceOverride: 'user' });
  });

  it('does not apply previewAudience for non-admin users', async () => {
    vi.mocked(auth.api.getSession).mockResolvedValue({
      user: { id: 'user-1', role: 'user', locale: 'en' },
    } as any);
    vi.mocked(readChatConversation).mockResolvedValueOnce(null);
    vi.mocked(createChatConversation).mockResolvedValueOnce({
      id: '6eccebe4-069a-4292-8d89-1f40392b935d',
      userId: 'user-1',
      medium: 'frontend',
      emailThreadId: null,
      title: '',
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    vi.mocked(generateSupportReplyStream).mockImplementationOnce(async () => ({
      result: {
        toUIMessageStreamResponse: vi.fn().mockReturnValue(new Response('ok')),
      } as any,
      getLatestCitations: () => [],
    }));

    const request = new Request('http://localhost/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: [
          {
            id: 'u1',
            role: 'user',
            parts: [{ type: 'text', text: 'Hello' }],
          },
        ],
        previewAudience: 'admin',
      }),
    });

    const response = await POST(request as any);
    expect(response.status).toBe(200);
    expect(vi.mocked(generateSupportReplyStream).mock.calls[0]?.[1]?.audienceOverride).toBeUndefined();
  });
});
