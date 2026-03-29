import * as z from 'zod';
import type { ChatConversation, ChatConversationMedium } from '@/domain/chat.model';
import { dbChatConversationReadByMediumAndThread } from '@/storage/conversation/conversation.read-by-medium-thread';

const readByMediumThreadInputSchema = z
  .object({
    medium: z.enum(['frontend', 'email']),
    emailThreadId: z.string().min(1),
  })
  .strict();

export const readChatConversationByMediumAndThread = async (input: {
  medium: ChatConversationMedium;
  emailThreadId: string;
}): Promise<ChatConversation | null> => {
  const validated = readByMediumThreadInputSchema.parse(input);
  return dbChatConversationReadByMediumAndThread(validated.medium, validated.emailThreadId);
};
