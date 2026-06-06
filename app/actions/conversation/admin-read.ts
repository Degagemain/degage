import type { ChatConversationAdminDetail } from '@/domain/chat.model';
import { dbChatConversationAdminRead } from '@/storage/conversation/conversation.admin-read';

export const readChatConversationForAdmin = async (id: string): Promise<ChatConversationAdminDetail | null> => {
  return dbChatConversationAdminRead(id);
};
