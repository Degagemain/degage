import type { ChatCitation, ChatMessageRole } from '@/domain/chat.model';
import { Prisma } from '@/storage/client/client';
import { getPrismaClient } from '@/storage/utils';

export const dbChatMessageCreate = async (input: {
  conversationId: string;
  externalId?: string | null;
  role: ChatMessageRole;
  content: string;
  citations?: ChatCitation[];
}): Promise<void> => {
  const prisma = getPrismaClient();
  await prisma.chatMessage.create({
    data: {
      conversationId: input.conversationId,
      externalId: input.externalId ?? null,
      role: input.role,
      content: input.content,
      citations: (input.citations ?? []) as unknown as Prisma.InputJsonValue,
    },
  });
};
