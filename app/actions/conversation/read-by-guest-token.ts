import * as z from 'zod';
import type { ChatConversation } from '@/domain/chat.model';
import { dbChatConversationReadByGuestToken } from '@/storage/conversation/conversation.read-by-guest-token';

const readByGuestTokenInputSchema = z
  .object({
    guestToken: z.string().min(1),
  })
  .strict();

export const readChatConversationByGuestToken = async (guestToken: string): Promise<ChatConversation | null> => {
  const validated = readByGuestTokenInputSchema.parse({ guestToken: guestToken.trim() });
  return dbChatConversationReadByGuestToken(validated.guestToken);
};
