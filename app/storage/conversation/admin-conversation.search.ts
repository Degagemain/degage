import type { ChatConversationListItem } from '@/domain/chat.model';
import type { AdminConversationFilter } from '@/domain/conversation.filter';
import type { Page } from '@/domain/page.model';
import { Prisma } from '@/storage/client/client';
import { getPrismaClient } from '@/storage/utils';
import { dbChatConversationListItemToDomain } from './conversation.mappers';

export const adminConversationFilterToQuery = (filter: AdminConversationFilter): Prisma.ChatConversationWhereInput => {
  const conditions: Prisma.ChatConversationWhereInput[] = [];

  const query = filter.query?.trim();
  if (query) {
    const search = { contains: query, mode: 'insensitive' as const };
    conditions.push({
      OR: [{ title: search }, { user: { name: search } }, { user: { email: search } }],
    });
  }

  if (filter.userIds.length > 0) {
    conditions.push({ userId: { in: filter.userIds } });
  }

  if (conditions.length === 0) {
    return {};
  }

  return conditions.length === 1 ? conditions[0] : { AND: conditions };
};

export const dbAdminChatConversationSearch = async (filter: AdminConversationFilter): Promise<Page<ChatConversationListItem>> => {
  const prisma = getPrismaClient();
  const whereClause = adminConversationFilterToQuery(filter);
  const total = await prisma.chatConversation.count({ where: whereClause });
  const rows = await prisma.chatConversation.findMany({
    where: whereClause,
    include: { user: true },
    skip: filter.skip,
    take: filter.take,
    orderBy: { [filter.sortBy]: filter.sortOrder },
  });

  return {
    records: rows.map(dbChatConversationListItemToDomain),
    total,
  };
};
