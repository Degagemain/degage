import { afterEach, describe, expect, it, vi } from 'vitest';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { Role } from '@/domain/role.model';
import type { McpAuthContext } from '@/mcp/auth-context';

vi.mock('@/actions/conversation/admin-search', () => ({
  searchChatConversationsForAdmin: vi.fn(),
}));

vi.mock('@/actions/conversation/admin-read', () => ({
  readChatConversationForAdmin: vi.fn(),
}));

import { readChatConversationForAdmin } from '@/actions/conversation/admin-read';
import { searchChatConversationsForAdmin } from '@/actions/conversation/admin-search';
import { registerSearchChatConversationsTool } from '@/mcp/tools/search-chat-conversations';

type ToolResult = {
  content: Array<{ type: string; text: string }>;
  isError?: boolean;
};

type ToolHandler = (input: { id?: string; mediums?: Array<'frontend' | 'email'>; userIds?: string[] }) => Promise<ToolResult>;

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
    expect(searchChatConversationsForAdmin).not.toHaveBeenCalled();
  });

  it('rejects callers without the admin role', async () => {
    const handler = registerAndGetHandler(() => ({
      ...adminContext,
      role: Role.USER,
    }));
    const result = await handler({});
    expect(result.isError).toBe(true);
    expect(result.content[0]?.text).toContain('Admin role');
    expect(searchChatConversationsForAdmin).not.toHaveBeenCalled();
  });

  it('returns the admin chat search without the user', async () => {
    const updatedAt = new Date('2026-05-01T00:00:00.000Z');
    vi.mocked(searchChatConversationsForAdmin).mockResolvedValueOnce({
      records: [
        {
          id: '6eccebe4-069a-4292-8d89-1f40392b935d',
          title: 'Battery',
          medium: 'frontend',
          user: { id: 'user-1', name: 'Ada <ada@example.com>' },
          updatedAt,
        },
      ],
      total: 1,
    });

    const handler = registerAndGetHandler(() => adminContext);
    const result = await handler({ mediums: ['frontend'], userIds: ['user-1'] });

    expect(result.isError).toBeUndefined();
    expect(searchChatConversationsForAdmin).toHaveBeenCalledWith(
      expect.objectContaining({
        mediums: ['frontend'],
        userIds: ['user-1'],
      }),
    );
    expect(JSON.parse(result.content[0]!.text)).toEqual({
      records: [
        {
          id: '6eccebe4-069a-4292-8d89-1f40392b935d',
          title: 'Battery',
          medium: 'frontend',
          updatedAt: updatedAt.toISOString(),
        },
      ],
      total: 1,
    });
    expect(result.content[0]?.text).not.toContain('ada@example.com');
    expect(readChatConversationForAdmin).not.toHaveBeenCalled();
  });

  it('returns one admin conversation without the user when id is set', async () => {
    vi.mocked(readChatConversationForAdmin).mockResolvedValueOnce({
      id: '6eccebe4-069a-4292-8d89-1f40392b935d',
      title: 'Battery',
      medium: 'email',
      emailThreadId: '<thread-1>',
      messages: [],
      user: { id: 'user-1', name: 'Ada' },
      createdAt: new Date('2026-05-01T00:00:00.000Z'),
      updatedAt: new Date('2026-05-01T00:00:00.000Z'),
    });

    const handler = registerAndGetHandler(() => adminContext);
    const result = await handler({ id: '6eccebe4-069a-4292-8d89-1f40392b935d' });

    expect(result.isError).toBeUndefined();
    expect(readChatConversationForAdmin).toHaveBeenCalledWith('6eccebe4-069a-4292-8d89-1f40392b935d');
    expect(searchChatConversationsForAdmin).not.toHaveBeenCalled();
    const body = JSON.parse(result.content[0]!.text);
    expect(body.user).toBeUndefined();
    expect(body.medium).toBe('email');
    expect(body.messages).toEqual([]);
  });

  it('returns not found when the conversation is missing', async () => {
    vi.mocked(readChatConversationForAdmin).mockResolvedValueOnce(null);
    const handler = registerAndGetHandler(() => adminContext);
    const result = await handler({ id: '6eccebe4-069a-4292-8d89-1f40392b935d' });
    expect(result.isError).toBe(true);
    expect(result.content[0]?.text).toBe('Conversation not found');
  });
});
