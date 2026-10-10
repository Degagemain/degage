import * as z from 'zod';
import { ChatConversationMcpSortColumns } from '@/domain/chat-conversation-mcp.filter';
import { chatConversationChannelValues } from '@/domain/chat.model';
import { DefaultTake, MaxTake, SortOrder } from '@/domain/utils';
import { contentLocales } from '@/i18n/locales';

export const searchChatConversationsMcpInputSchema = {
  id: z
    .uuid()
    .optional()
    .describe('Conversation UUID. When set, return that conversation and its messages instead of a list. Other filters are ignored.'),
  from: z
    .string()
    .optional()
    .describe('Inclusive start of the conversation createdAt range. ISO date (YYYY-MM-DD, start of that UTC day) or datetime.'),
  to: z
    .string()
    .optional()
    .describe('Inclusive end of the conversation createdAt range. ISO date (YYYY-MM-DD, end of that UTC day) or datetime.'),
  locale: z
    .enum(contentLocales)
    .optional()
    .describe(
      `Conversation language (${contentLocales.join(', ')}). ` +
        'Uses the locale stored on the chat, or the signed-in user language when the chat has none.',
    ),
  channel: z.enum(chatConversationChannelValues).optional().describe('Channel: chat (in-app support widget) or email (support mailbox).'),
  noResults: z
    .boolean()
    .optional()
    .describe(
      'When true, only conversations where an assistant reply found no documentation. ' + 'When false, only conversations with no such gap.',
    ),
  skip: z.number().int().min(0).optional().describe('Pagination offset (default 0).'),
  take: z.number().int().min(0).max(MaxTake).optional().describe(`Page size (default ${DefaultTake}, max ${MaxTake}).`),
  sortBy: z
    .enum([ChatConversationMcpSortColumns.CREATED_AT, ChatConversationMcpSortColumns.UPDATED_AT])
    .optional()
    .describe('Sort column: createdAt or updatedAt.'),
  sortOrder: z.enum([SortOrder.ASC, SortOrder.DESC]).optional().describe('Sort direction: asc or desc.'),
};
