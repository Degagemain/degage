import type { ChatConversationMcpFilter } from '@/domain/chat-conversation-mcp.filter';
import type { ChatConversationMcpDetail, ChatConversationMcpListItem } from '@/domain/chat-conversation-mcp.model';
import { chatConversationChannelToMedium } from '@/domain/chat.model';
import type { Page } from '@/domain/page.model';
import { Prisma } from '@/storage/client/client';
import { getPrismaClient } from '@/storage/utils';
import { toChatConversationMcpDetail, toChatConversationMcpListItem } from './conversation.mappers';

const historicalChatDocumentationGap: Prisma.ChatMessageWhereInput = {
  role: 'assistant',
  noResults: null,
  citations: { equals: [] },
};

/** Matches assistantTurnIsDocumentationGap for rows already stored. */
export const documentationGapWhere = (): Prisma.ChatConversationWhereInput => ({
  OR: [
    { messages: { some: { role: 'assistant', noResults: true } } },
    { medium: 'frontend', messages: { some: historicalChatDocumentationGap } },
  ],
});

export const filterToQuery = (filter: ChatConversationMcpFilter): Prisma.ChatConversationWhereInput => {
  const conditions: Prisma.ChatConversationWhereInput[] = [];

  if (filter.from || filter.to) {
    conditions.push({
      createdAt: {
        ...(filter.from ? { gte: filter.from } : {}),
        ...(filter.to ? { lte: filter.to } : {}),
      },
    });
  }

  if (filter.locale) {
    conditions.push({
      OR: [{ locale: filter.locale }, { locale: null, user: { locale: filter.locale } }],
    });
  }

  if (filter.channel) {
    conditions.push({ medium: chatConversationChannelToMedium(filter.channel) });
  }

  if (filter.noResults === true) {
    conditions.push(documentationGapWhere());
  } else if (filter.noResults === false) {
    conditions.push({ messages: { some: { role: 'assistant' } } });
    conditions.push({ NOT: documentationGapWhere() });
  }

  if (conditions.length === 0) return {};
  if (conditions.length === 1) return conditions[0];
  return { AND: conditions };
};

const mcpConversationInclude = {
  user: { select: { locale: true } },
  messages: {
    where: { role: 'assistant' },
    select: { id: true, role: true, citations: true, noResults: true, createdAt: true },
  },
} satisfies Prisma.ChatConversationInclude;

export const dbChatConversationMcpSearch = async (filter: ChatConversationMcpFilter): Promise<Page<ChatConversationMcpListItem>> => {
  const prisma = getPrismaClient();
  const where = filterToQuery(filter);
  const total = await prisma.chatConversation.count({ where });
  const records = await prisma.chatConversation.findMany({
    where,
    include: mcpConversationInclude,
    skip: filter.skip,
    take: filter.take,
    orderBy: { [filter.sortBy]: filter.sortOrder },
  });

  return {
    records: records.map(toChatConversationMcpListItem),
    total,
  };
};

export const dbChatConversationMcpRead = async (id: string): Promise<ChatConversationMcpDetail | null> => {
  const prisma = getPrismaClient();
  const row = await prisma.chatConversation.findUnique({
    where: { id },
    include: {
      user: { select: { locale: true } },
      messages: { orderBy: { createdAt: 'asc' } },
    },
  });
  return row ? toChatConversationMcpDetail(row) : null;
};
