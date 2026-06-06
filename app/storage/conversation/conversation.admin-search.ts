import type { ChatConversationListItem } from '@/domain/chat.model';
import type { ChatConversationAdminFilter } from '@/domain/chat-conversation-admin.filter';
import { CHAT_CONVERSATION_OWNER_TYPE_ANONYMOUS } from '@/domain/chat-conversation-admin.filter';
import type { Page } from '@/domain/page.model';
import { Prisma } from '@/storage/client/client';
import { getPrismaClient } from '@/storage/utils';
import { dbChatConversationToListItem } from './conversation.mappers';

export const filterToQuery = (filter: ChatConversationAdminFilter): Prisma.ChatConversationWhereInput => {
  const ownerConditions: Prisma.ChatConversationWhereInput[] = [];

  if (filter.userIds.length > 0) {
    ownerConditions.push({ userId: { in: filter.userIds } });
  }
  if (filter.ownerTypes.includes(CHAT_CONVERSATION_OWNER_TYPE_ANONYMOUS)) {
    ownerConditions.push({ userId: null });
  }

  if (ownerConditions.length === 0) {
    return {};
  }
  if (ownerConditions.length === 1) {
    return ownerConditions[0];
  }
  return { OR: ownerConditions };
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
