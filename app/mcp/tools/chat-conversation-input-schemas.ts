import * as z from 'zod';
import { ChatConversationAdminSortColumns } from '@/domain/chat-conversation-admin.filter';
import { chatConversationMediumValues } from '@/domain/chat.model';
import { DefaultTake, MaxTake, SortOrder } from '@/domain/utils';

export const searchChatConversationsMcpInputSchema = {
  id: z.uuid().optional().describe('Conversation UUID. When set, return that conversation instead of the list. Other filters are ignored.'),
  userIds: z.array(z.string().min(1)).optional().describe('Filter the list by user id. Same filter as the admin support chat list.'),
  mediums: z
    .array(z.enum(chatConversationMediumValues))
    .optional()
    .describe('Filter the list by channel. frontend is in-app chat; email is the support mailbox.'),
  skip: z.number().int().min(0).optional().describe('Pagination offset (default 0).'),
  take: z.number().int().min(0).max(MaxTake).optional().describe(`Page size (default ${DefaultTake}, max ${MaxTake}).`),
  sortBy: z
    .nativeEnum(ChatConversationAdminSortColumns)
    .optional()
    .describe(`Sort column. Values: ${Object.values(ChatConversationAdminSortColumns).join(', ')}.`),
  sortOrder: z.nativeEnum(SortOrder).optional().describe('Sort direction: asc or desc.'),
};
