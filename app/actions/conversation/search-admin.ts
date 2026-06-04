import type { ChatConversationListItem } from '@/domain/chat.model';
import { type AdminConversationFilter, adminConversationFilterSchema } from '@/domain/conversation.filter';
import type { Page } from '@/domain/page.model';
import { dbAdminChatConversationSearch } from '@/storage/conversation/admin-conversation.search';

export const searchAdminChatConversations = async (filter: AdminConversationFilter): Promise<Page<ChatConversationListItem>> => {
  const validatedFilter = adminConversationFilterSchema.parse(filter);
  return dbAdminChatConversationSearch(validatedFilter);
};
