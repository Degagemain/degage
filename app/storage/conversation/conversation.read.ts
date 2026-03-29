import type { ChatConversation } from '@/domain/chat.model';
import { getPrismaClient } from '@/storage/utils';
import { dbChatConversationToDomain } from './conversation.mappers';

export const dbChatConversationRead = async (id: string): Promise<ChatConversation | null> => {
  const prisma = getPrismaClient();
  const row = await prisma.chatConversation.findUnique({
    where: { id },
    include: { messages: { orderBy: { createdAt: 'asc' } } },
  });
  return row ? dbChatConversationToDomain(row) : null;
};
