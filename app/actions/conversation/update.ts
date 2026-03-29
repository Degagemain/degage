import { type ChatConversationUpdateInput, chatConversationUpdateInputSchema } from '@/domain/chat.model';
import { dbChatConversationUpdate } from '@/storage/conversation/conversation.update';

export const updateChatConversation = async (id: string, input: ChatConversationUpdateInput): Promise<void> => {
  const validated = chatConversationUpdateInputSchema.parse(input);
  await dbChatConversationUpdate(id, validated);
};
