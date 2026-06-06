import type { ChatConversationListItem } from '@/domain/chat.model';
import type { ChatConversationAdminFilter } from '@/domain/chat-conversation-admin.filter';
import type { Page } from '@/domain/page.model';
import { Prisma } from '@/storage/client/client';
import { getPrismaClient } from '@/storage/utils';
import { dbChatConversationToListItem } from './conversation.mappers';

export const filterToQuery = (filter: ChatConversationAdminFilter): Prisma.ChatConversationWhereInput => {
  if (filter.userIds.length === 0) {
    return {};
  }
  return { userId: { in: filter.userIds } };
};

export const dbChatConversationAdminSearch = async (filter: ChatConversationAdminFilter): Promise<Page<ChatConversationListItem>> => {
  const prisma = getPrismaClient();
  const whereClause = filterToQuery(filter);
  const total = await prisma.chatConversation.count({ where: whereClause });
  const records = await prisma.chatConversation.findMany({
    where: whereClause,
    include: { user: true },
    skip: filter.skip,
    take: filter.take,
    orderBy: { [filter.sortBy]: filter.sortOrder },
  });

  return {
    records: records.map(dbChatConversationToListItem),
    total,
  };
};
