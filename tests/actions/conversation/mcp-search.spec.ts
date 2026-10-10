import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/storage/conversation/conversation.mcp-search', () => ({
  dbChatConversationMcpSearch: vi.fn(),
  dbChatConversationMcpRead: vi.fn(),
}));

import { readChatConversationForMcp, searchChatConversationsForMcp } from '@/actions/conversation/mcp-search';
import { dbChatConversationMcpRead, dbChatConversationMcpSearch } from '@/storage/conversation/conversation.mcp-search';

describe('searchChatConversationsForMcp', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('parses filters before searching', async () => {
    vi.mocked(dbChatConversationMcpSearch).mockResolvedValueOnce({ records: [], total: 0 });

    await searchChatConversationsForMcp({ channel: 'chat', from: '2026-01-01', locale: 'nl' });

    expect(dbChatConversationMcpSearch).toHaveBeenCalledWith(
      expect.objectContaining({
        channel: 'chat',
        locale: 'nl',
        from: new Date('2026-01-01T00:00:00.000Z'),
        noResults: null,
      }),
    );
  });

  it('reads one conversation by id', async () => {
    vi.mocked(dbChatConversationMcpRead).mockResolvedValueOnce(null);
    await expect(readChatConversationForMcp('6eccebe4-069a-4292-8d89-1f40392b935d')).resolves.toBeNull();
    expect(dbChatConversationMcpRead).toHaveBeenCalledWith('6eccebe4-069a-4292-8d89-1f40392b935d');
  });
});
