import type { ChatConversationUpdateInput } from '@/domain/chat.model';
import { getPrismaClient } from '@/storage/utils';
import { chatConversationUpdateToDb } from './conversation.mappers';

export const dbChatConversationUpdate = async (id: string, input: ChatConversationUpdateInput): Promise<void> => {
  const prisma = getPrismaClient();
  await prisma.chatConversation.update({
    where: { id },
    data: chatConversationUpdateToDb(input),
  });
};
