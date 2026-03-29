import type { ChatConversation } from '@/domain/chat.model';
import type { ConversationFilter } from '@/domain/conversation.filter';
import { Prisma } from '@/storage/client/client';
import { getPrismaClient } from '@/storage/utils';
import { dbChatConversationToDomain } from './conversation.mappers';

export const filterToQuery = (filter: ConversationFilter): Prisma.ChatConversationWhereInput => {
  return {
    userId: filter.userId,
  };
};

export const dbChatConversationSearch = async (filter: ConversationFilter): Promise<ChatConversation[]> => {
  const prisma = getPrismaClient();
  const whereClause = filterToQuery(filter);
  const rows = await prisma.chatConversation.findMany({
    where: whereClause,
    include: {
      messages: {
        orderBy: { createdAt: 'asc' },
      },
    },
    orderBy: { updatedAt: 'desc' },
  });
  return rows.map(dbChatConversationToDomain);
};
