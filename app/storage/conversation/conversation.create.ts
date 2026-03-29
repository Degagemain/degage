import type { ChatConversation, ChatConversationCreateInput } from '@/domain/chat.model';
import { getPrismaClient } from '@/storage/utils';
import { dbChatConversationToDomain } from './conversation.mappers';

export const dbChatConversationCreate = async (input: ChatConversationCreateInput): Promise<ChatConversation> => {
  const prisma = getPrismaClient();
  const row = await prisma.chatConversation.create({
    data: {
      userId: input.userId ?? null,
      medium: input.medium ?? 'frontend',
      emailThreadId: input.emailThreadId ?? null,
      title: input.title ?? '',
    },
    include: { messages: { orderBy: { createdAt: 'asc' } } },
  });
  return dbChatConversationToDomain(row);
};
