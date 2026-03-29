import type { ChatConversation } from '@/domain/chat.model';
import { dbChatConversationSearch } from './conversation.search';

export const dbChatConversationListByUser = async (userId: string): Promise<ChatConversation[]> => {
  return dbChatConversationSearch({ userId });
};
