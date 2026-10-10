import { afterEach, describe, expect, it, vi } from 'vitest';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { Role } from '@/domain/role.model';
import type { McpAuthContext } from '@/mcp/auth-context';

vi.mock('@/actions/conversation/mcp-search', () => ({
  searchChatConversationsForMcp: vi.fn(),
  readChatConversationForMcp: vi.fn(),
}));

import { readChatConversationForMcp, searchChatConversationsForMcp } from '@/actions/conversation/mcp-search';
import { registerSearchChatConversationsTool } from '@/mcp/tools/search-chat-conversations';

type ToolResult = {
  content: Array<{ type: string; text: string }>;
  isError?: boolean;
};

type ToolHandler = (input: { id?: string; from?: string; channel?: 'chat' | 'email'; noResults?: boolean }) => Promise<ToolResult>;

const adminContext: McpAuthContext = {
  userId: 'admin-1',
  role: Role.ADMIN,
  emailVerified: true,
  banned: false,
  scopes: ['mcp:admin'],
  clientId: 'client-1',
};

const registerAndGetHandler = (getContext: () => McpAuthContext | null): ToolHandler => {
  const registerTool = vi.fn();
  const server = { registerTool } as unknown as McpServer;
  registerSearchChatConversationsTool(server, getContext, 'mcp:admin');
  expect(registerTool).toHaveBeenCalledWith('search_chat_conversations', expect.any(Object), expect.any(Function));
  return registerTool.mock.calls[0]![2] as ToolHandler;
};

describe('search_chat_conversations tool', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('returns unauthorized when there is no auth context', async () => {
    const handler = registerAndGetHandler(() => null);
    const result = await handler({});
    expect(result.isError).toBe(true);
    expect(result.content[0]?.text).toBe('Unauthorized');
    expect(searchChatConversationsForMcp).not.toHaveBeenCalled();
  });

  it('rejects callers without the admin role', async () => {
    const handler = registerAndGetHandler(() => ({
      ...adminContext,
      role: Role.USER,
    }));
    const result = await handler({});
    expect(result.isError).toBe(true);
    expect(result.content[0]?.text).toContain('Admin role');
    expect(searchChatConversationsForMcp).not.toHaveBeenCalled();
  });

  it('lists conversations for an admin', async () => {
    const createdAt = new Date('2026-05-01T00:00:00.000Z');
    vi.mocked(searchChatConversationsForMcp).mockResolvedValueOnce({
      records: [
        {
          id: '6eccebe4-069a-4292-8d89-1f40392b935d',
          title: 'Battery',
          channel: 'chat',
          locale: 'nl',
          noResults: true,
          createdAt,
          updatedAt: createdAt,
        },
      ],
      total: 1,
    });

    const handler = registerAndGetHandler(() => adminContext);
    const result = await handler({ from: '2026-05-01', channel: 'chat', noResults: true });

    expect(result.isError).toBeUndefined();
    expect(searchChatConversationsForMcp).toHaveBeenCalledWith(
      expect.objectContaining({ from: '2026-05-01', channel: 'chat', noResults: true }),
    );
    expect(JSON.parse(result.content[0]!.text)).toEqual({
      records: [
        {
          id: '6eccebe4-069a-4292-8d89-1f40392b935d',
          title: 'Battery',
          channel: 'chat',
          locale: 'nl',
          noResults: true,
          createdAt: createdAt.toISOString(),
          updatedAt: createdAt.toISOString(),
        },
      ],
      total: 1,
    });
  });

  it('returns one conversation when id is set', async () => {
    vi.mocked(readChatConversationForMcp).mockResolvedValueOnce({
      id: '6eccebe4-069a-4292-8d89-1f40392b935d',
      title: 'Battery',
      channel: 'chat',
      locale: 'nl',
      noResults: false,
      createdAt: new Date('2026-05-01T00:00:00.000Z'),
      updatedAt: new Date('2026-05-01T00:00:00.000Z'),
      messages: [],
    });

    const handler = registerAndGetHandler(() => adminContext);
    const result = await handler({ id: '6eccebe4-069a-4292-8d89-1f40392b935d', channel: 'email' });

    expect(result.isError).toBeUndefined();
    expect(readChatConversationForMcp).toHaveBeenCalledWith('6eccebe4-069a-4292-8d89-1f40392b935d');
    expect(searchChatConversationsForMcp).not.toHaveBeenCalled();
  });

  it('returns not found when the conversation is missing', async () => {
    vi.mocked(readChatConversationForMcp).mockResolvedValueOnce(null);
    const handler = registerAndGetHandler(() => adminContext);
    const result = await handler({ id: '6eccebe4-069a-4292-8d89-1f40392b935d' });
    expect(result.isError).toBe(true);
    expect(result.content[0]?.text).toBe('Conversation not found');
  });
});
