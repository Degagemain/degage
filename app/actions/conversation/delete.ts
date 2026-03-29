import type { UserWithRole } from '@/domain/role.model';
import { isAdmin } from '@/domain/role.utils';
import { dbChatConversationDelete } from '@/storage/conversation/conversation.delete';
import { dbChatConversationRead } from '@/storage/conversation/conversation.read';

export const deleteChatConversation = async (id: string, viewer: UserWithRole): Promise<boolean> => {
  const conversation = await dbChatConversationRead(id);
  if (!conversation) return false;
  if (!isAdmin(viewer) && conversation.userId !== viewer.id) return false;
  await dbChatConversationDelete(id);
  return true;
};
