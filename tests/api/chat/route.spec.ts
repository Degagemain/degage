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
      guestToken: null,
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
      guestToken: null,
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

  it('persists anonymous conversations after the first message', async () => {
    vi.mocked(auth.api.getSession).mockResolvedValue(null);
    vi.mocked(createChatConversation).mockResolvedValueOnce({
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
    vi.mocked(generateSupportReplyStream).mockImplementationOnce(async (_messages: any, options: any) => {
      await options.onFinish?.({ text: 'anonymous answer', citations: [] });
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
    expect(createChatConversation).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: null,
        guestToken: expect.any(String),
        medium: 'frontend',
      }),
    );
    expect(createMessage).toHaveBeenCalled();
    expect(vi.mocked(createMessage).mock.calls.some(([input]) => input.role === 'assistant' && input.content === 'anonymous answer')).toBe(
      true,
    );
  });

  it('resumes anonymous conversations when conversationId and guestToken are provided', async () => {
    vi.mocked(auth.api.getSession).mockResolvedValue(null);
    vi.mocked(readChatConversation).mockReset();
    vi.mocked(readChatConversation).mockResolvedValue({
      id: '6eccebe4-069a-4292-8d89-1f40392b935d',
      userId: null,
      medium: 'frontend',
      emailThreadId: null,
      guestToken: 'guest-token-1',
      title: 'Hello',
      messages: [
        {
          id: 'm1',
          conversationId: '6eccebe4-069a-4292-8d89-1f40392b935d',
          externalId: 'u1',
          externalMessageId: null,
          role: 'user',
          content: 'Hello',
          citations: [],
          createdAt: new Date(),
        },
      ],
      createdAt: new Date(),
      updatedAt: new Date(),
    } as any);
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
        conversationId: '6eccebe4-069a-4292-8d89-1f40392b935d',
        guestToken: 'guest-token-1',
        messages: [
          {
            id: 'u1',
            role: 'user',
            parts: [{ type: 'text', text: 'Hello' }],
          },
          {
            id: 'u2',
            role: 'user',
            parts: [{ type: 'text', text: 'Follow up' }],
          },
        ],
      }),
    });

    const response = await POST(request as any);
    expect(response.status).toBe(200);
    expect(createChatConversation).not.toHaveBeenCalled();
    expect(readChatConversation).toHaveBeenCalledWith('6eccebe4-069a-4292-8d89-1f40392b935d', null, {
      guestToken: 'guest-token-1',
    });
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
      guestToken: null,
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
