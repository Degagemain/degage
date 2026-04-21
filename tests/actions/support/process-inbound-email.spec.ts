import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/actions/conversation/create', () => ({
  createChatConversation: vi.fn(),
}));

vi.mock('@/actions/conversation/read-by-medium-thread', () => ({
  readChatConversationByMediumAndThread: vi.fn(),
}));

vi.mock('@/actions/conversation/message/create', () => ({
  createMessage: vi.fn(),
}));

vi.mock('@/actions/support/generate-reply', () => ({
  generateSupportReplyText: vi.fn(),
}));

vi.mock('@/context/request-context', () => ({
  getRequestId: vi.fn(() => 'test-req'),
  getRequestUserId: vi.fn(),
  withRequestContext: vi.fn((_, fn) => fn()),
}));

vi.mock('@/integrations/resend', () => ({
  getResendClient: vi.fn(),
  sendEmail: vi.fn(),
}));

import { createChatConversation } from '@/actions/conversation/create';
import { readChatConversationByMediumAndThread } from '@/actions/conversation/read-by-medium-thread';
import { createMessage } from '@/actions/conversation/message/create';
import { generateSupportReplyText } from '@/actions/support/generate-reply';
import { processInboundSupportEmail } from '@/actions/support/process-inbound-email';
import { getResendClient, sendEmail } from '@/integrations/resend';

describe('processInboundSupportEmail', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('creates an email conversation, stores messages, and replies', async () => {
    vi.mocked(getResendClient).mockReturnValue({
      emails: {
        receiving: {
          get: vi.fn().mockResolvedValue({
            data: {
              text: 'I need help with my account.',
              headers: [{ name: 'References', value: '<old-1>' }],
            },
          }),
        },
      },
    } as any);
    vi.mocked(readChatConversationByMediumAndThread).mockResolvedValueOnce(null);
    vi.mocked(createChatConversation).mockResolvedValueOnce({
      id: 'f3ca74c4-c552-4d3a-a141-e7b0a1850c3e',
      userId: null,
      medium: 'email',
      emailThreadId: '<old-1>',
      title: 'Support request',
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    vi.mocked(generateSupportReplyText).mockResolvedValueOnce({
      text: 'Thank you for your message. Here is how to proceed.',
      citations: [],
    });
    vi.mocked(sendEmail).mockResolvedValueOnce({ id: 'out-1' });

    await processInboundSupportEmail({
      type: 'email.received',
      data: {
        email_id: 'inbound-email-id',
        from: 'User <user@example.com>',
        to: ['support@example.com'],
        subject: 'Support request',
        message_id: '<msg-1>',
      },
    });

    expect(readChatConversationByMediumAndThread).toHaveBeenCalledWith({
      medium: 'email',
      emailThreadId: '<old-1>',
    });
    expect(createMessage).toHaveBeenCalledWith(
      expect.objectContaining({
        conversationId: 'f3ca74c4-c552-4d3a-a141-e7b0a1850c3e',
        role: 'user',
        externalMessageId: '<msg-1>',
      }),
    );
    expect(sendEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: 'user@example.com',
      }),
    );
    expect(createMessage).toHaveBeenCalledWith(
      expect.objectContaining({
        conversationId: 'f3ca74c4-c552-4d3a-a141-e7b0a1850c3e',
        role: 'assistant',
        externalMessageId: 'out-1',
      }),
    );
  });

  it('returns early on duplicate inbound message id', async () => {
    vi.mocked(getResendClient).mockReturnValue({
      emails: {
        receiving: {
          get: vi.fn().mockResolvedValue({
            data: {
              text: 'hello again',
              headers: [],
            },
          }),
        },
      },
    } as any);
    vi.mocked(readChatConversationByMediumAndThread).mockResolvedValueOnce({
      id: 'f3ca74c4-c552-4d3a-a141-e7b0a1850c3e',
      userId: null,
      medium: 'email',
      emailThreadId: '<msg-1>',
      title: 'Support request',
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    vi.mocked(createMessage).mockRejectedValueOnce({ code: 'P2002' } as never);

    await processInboundSupportEmail({
      type: 'email.received',
      data: {
        email_id: 'inbound-email-id',
        from: 'User <user@example.com>',
        to: ['support@example.com'],
        subject: 'Support request',
        message_id: '<msg-1>',
      },
    });

    expect(generateSupportReplyText).not.toHaveBeenCalled();
    expect(sendEmail).not.toHaveBeenCalled();
  });
});
