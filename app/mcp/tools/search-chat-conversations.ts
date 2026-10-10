import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { readChatConversationForMcp, searchChatConversationsForMcp } from '@/actions/conversation/mcp-search';
import { type McpAuthContext, canUseMcpTools, mcpToolGateErrorMessage } from '@/mcp/auth-context';
import { searchChatConversationsMcpInputSchema } from '@/mcp/tools/chat-conversation-input-schemas';

export const registerSearchChatConversationsTool = (
  server: McpServer,
  getContext: () => McpAuthContext | null,
  requiredScope: string,
): void => {
  server.registerTool(
    'search_chat_conversations',
    {
      description:
        'Search support conversations for editorial review. Read-only. ' +
        'Omits names, email addresses, and user ids. ' +
        'Without id, returns { records, total } with id, title, channel (chat or email), locale, noResults, createdAt, and updatedAt. ' +
        'Filter with from, to, locale, channel, and noResults. ' +
        'With id, returns that conversation and its messages. Assistant messages include citations as { externalId, title }.',
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
          const detail = await readChatConversationForMcp(input.id);
          if (!detail) {
            return {
              content: [{ type: 'text' as const, text: 'Conversation not found' }],
              isError: true,
            };
          }
          return {
            content: [{ type: 'text' as const, text: JSON.stringify(detail, null, 2) }],
          };
        }

        const result = await searchChatConversationsForMcp({
          from: input.from,
          to: input.to,
          locale: input.locale,
          channel: input.channel,
          noResults: input.noResults,
          skip: input.skip,
          take: input.take,
          sortBy: input.sortBy,
          sortOrder: input.sortOrder,
        });
        return {
          content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }],
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
