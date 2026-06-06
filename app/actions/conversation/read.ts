import type { ChatConversation } from '@/domain/chat.model';
import type { UserWithRole } from '@/domain/role.model';
import { isAdmin } from '@/domain/role.utils';
import { dbChatConversationRead } from '@/storage/conversation/conversation.read';

type ReadChatConversationOptions = {
  guestToken?: string | null;
};

export const readChatConversation = async (
  id: string,
  viewer: UserWithRole | null | undefined,
  options?: ReadChatConversationOptions,
): Promise<ChatConversation | null> => {
  const conversation = await dbChatConversationRead(id);
  if (!conversation) return null;
  if (isAdmin(viewer)) return conversation;

  const guestToken = options?.guestToken?.trim();
  if (!conversation.userId && guestToken && conversation.guestToken === guestToken) {
    return conversation;
  }

  const userId = viewer?.id;
  if (!userId) return null;
  if (!conversation.userId) return null;
  if (conversation.userId !== userId) return null;
  return conversation;
};
