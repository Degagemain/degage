import type { ChatConversation } from '@/domain/chat.model';
import { type ConversationFilter, conversationFilterSchema } from '@/domain/conversation.filter';
import { dbChatConversationSearch } from '@/storage/conversation/conversation.search';

export const searchChatConversations = async (filter: ConversationFilter): Promise<ChatConversation[]> => {
  const validatedFilter = conversationFilterSchema.parse(filter);
  return dbChatConversationSearch(validatedFilter);
};
