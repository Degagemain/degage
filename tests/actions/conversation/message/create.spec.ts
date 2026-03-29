import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/storage/conversation/message/create', () => ({
  dbChatMessageCreate: vi.fn(),
}));

import { createMessage } from '@/actions/conversation/message/create';
import { chatUserMessageMaxLength } from '@/domain/chat.model';
import { dbChatMessageCreate } from '@/storage/conversation/message/create';

describe('createMessage', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('validates and forwards valid payloads', async () => {
    await createMessage({
      conversationId: 'b7490381-1d67-4f34-bb54-bd725adf3f8e',
      role: 'user',
      content: 'hello',
    });

    expect(dbChatMessageCreate).toHaveBeenCalledWith({
      conversationId: 'b7490381-1d67-4f34-bb54-bd725adf3f8e',
      externalId: null,
      role: 'user',
      content: 'hello',
      citations: [],
    });
  });

  it('rejects messages over max length', async () => {
    await expect(
      createMessage({
        conversationId: 'b7490381-1d67-4f34-bb54-bd725adf3f8e',
        role: 'user',
        content: 'x'.repeat(chatUserMessageMaxLength + 1),
      }),
    ).rejects.toThrow();
    expect(dbChatMessageCreate).not.toHaveBeenCalled();
  });

  it('rejects invalid conversation IDs', async () => {
    await expect(
      createMessage({
        conversationId: 'not-a-uuid',
        role: 'assistant',
        content: 'hello',
      }),
    ).rejects.toThrow();
    expect(dbChatMessageCreate).not.toHaveBeenCalled();
  });
});
