import type { Page } from '@/domain/page.model';
import type { ChatConversationListItem } from '@/domain/chat.model';
import { type ChatConversationAdminFilter, chatConversationAdminFilterSchema } from '@/domain/chat-conversation-admin.filter';
import { dbChatConversationAdminSearch } from '@/storage/conversation/conversation.admin-search';

export const searchChatConversationsForAdmin = async (filter: ChatConversationAdminFilter): Promise<Page<ChatConversationListItem>> => {
  const validatedFilter = chatConversationAdminFilterSchema.parse(filter);
  return dbChatConversationAdminSearch(validatedFilter);
};
