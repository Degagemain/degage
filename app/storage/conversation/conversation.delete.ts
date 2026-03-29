import { getPrismaClient } from '@/storage/utils';

export const dbChatConversationDelete = async (id: string): Promise<void> => {
  const prisma = getPrismaClient();
  await prisma.chatConversation.delete({
    where: { id },
  });
};
