import type { ChatConversation, ChatConversationMedium } from '@/domain/chat.model';
import { getPrismaClient } from '@/storage/utils';
import { dbChatConversationToDomain } from './conversation.mappers';

export const dbChatConversationReadByMediumAndThread = async (
  medium: ChatConversationMedium,
  emailThreadId: string,
): Promise<ChatConversation | null> => {
  const prisma = getPrismaClient();
  const row = await prisma.chatConversation.findUnique({
    where: {
      medium_emailThreadId: {
        medium,
        emailThreadId,
      },
    },
    include: {
      messages: {
        orderBy: { createdAt: 'asc' },
      },
    },
  });

  return row ? dbChatConversationToDomain(row) : null;
};
