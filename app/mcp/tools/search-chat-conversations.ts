import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { readChatConversationForAdmin } from '@/actions/conversation/admin-read';
import { searchChatConversationsForAdmin } from '@/actions/conversation/admin-search';
import { chatConversationAdminFilterSchema } from '@/domain/chat-conversation-admin.filter';
import { type McpAuthContext, canUseMcpTools, mcpToolGateErrorMessage } from '@/mcp/auth-context';
import { searchChatConversationsMcpInputSchema } from '@/mcp/tools/chat-conversation-input-schemas';

const withoutUser = <T extends { user?: unknown }>(record: T): Omit<T, 'user'> => {
  const copy = { ...record };
  delete copy.user;
  return copy;
};

export const registerSearchChatConversationsTool = (
  server: McpServer,
  getContext: () => McpAuthContext | null,
  requiredScope: string,
): void => {
  server.registerTool(
    'search_chat_conversations',
    {
      description:
        'Read-only search of support chats, using the same filters as the admin support chat list. ' +
        'Returns { records, total }. Records have id, title, medium (frontend or email), and updatedAt. ' +
        'User name and email are omitted. ' +
        'Pass id to return one conversation and its messages, including cited article title and url on assistant messages.',
      inputSchema: searchChatConversationsMcpInputSchema,
    },
    async (input) => {
      const ctx = getContext();
      if (!ctx) {
        return {
          content: [{ type: 'text' as const, text: 'Unauthorized' }],
          isError: true,
        };
      }

      const gate = canUseMcpTools(ctx, requiredScope, true);
      if (!gate.ok) {
        return {
          content: [{ type: 'text' as const, text: mcpToolGateErrorMessage(gate.reason) }],
          isError: true,
        };
      }

      try {
        if (input.id) {
          const detail = await readChatConversationForAdmin(input.id);
          if (!detail) {
            return {
              content: [{ type: 'text' as const, text: 'Conversation not found' }],
              isError: true,
            };
          }
          return {
            content: [{ type: 'text' as const, text: JSON.stringify(withoutUser(detail), null, 2) }],
          };
        }

        const filter = chatConversationAdminFilterSchema.parse({
          userIds: input.userIds,
          mediums: input.mediums,
          skip: input.skip,
          take: input.take,
          sortBy: input.sortBy,
          sortOrder: input.sortOrder,
        });
        const result = await searchChatConversationsForAdmin(filter);
        return {
          content: [
            {
              type: 'text' as const,
              text: JSON.stringify({ ...result, records: result.records.map(withoutUser) }, null, 2),
            },
          ],
        };
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to search chat conversations';
        return {
          content: [{ type: 'text' as const, text: message }],
          isError: true,
        };
      }
    },
  );
};
