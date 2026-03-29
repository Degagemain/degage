import { type ChatConversation, type ChatConversationCreateInput, chatConversationCreateInputSchema } from '@/domain/chat.model';
import { dbChatConversationCreate } from '@/storage/conversation/conversation.create';

export const createChatConversation = async (input: ChatConversationCreateInput): Promise<ChatConversation> => {
  const validated = chatConversationCreateInputSchema.parse(input);
  return dbChatConversationCreate(validated);
};
