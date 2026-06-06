import type { ChatConversationAdminDetail } from '@/domain/chat.model';
import { getPrismaClient } from '@/storage/utils';
import { dbChatConversationToAdminDetail } from './conversation.mappers';

export const dbChatConversationAdminRead = async (id: string): Promise<ChatConversationAdminDetail | null> => {
  const prisma = getPrismaClient();
  const row = await prisma.chatConversation.findUnique({
    where: { id },
    include: {
      user: true,
      messages: { orderBy: { createdAt: 'asc' } },
    },
  });
  return row ? dbChatConversationToAdminDetail(row) : null;
};
