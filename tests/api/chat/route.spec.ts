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

vi.mock('@ai-sdk/google', () => ({
  google: vi.fn().mockReturnValue('mock-model'),
}));

vi.mock('ai', () => ({
  convertToModelMessages: vi.fn().mockResolvedValue([]),
  stepCountIs: vi.fn().mockReturnValue(() => false),
  streamText: vi.fn(),
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

vi.mock('@/actions/documentation/search-rag', () => ({
  searchDocumentationForRag: vi.fn(),
}));

import { streamText } from 'ai';
import { createChatConversation } from '@/actions/conversation/create';
import { createMessage } from '@/actions/conversation/message/create';
import { readChatConversation } from '@/actions/conversation/read';
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
      title: '',
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    vi.mocked(streamText).mockImplementationOnce((args: any) => {
      void args.onFinish?.({ text: 'assistant answer' });
      return {
        toUIMessageStreamResponse: vi.fn().mockReturnValue(new Response('ok')),
      } as any;
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
});
