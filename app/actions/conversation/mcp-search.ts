import { chatConversationMcpFilterSchema } from '@/domain/chat-conversation-mcp.filter';
import type { ChatConversationMcpDetail, ChatConversationMcpListItem } from '@/domain/chat-conversation-mcp.model';
import type { Page } from '@/domain/page.model';
import { dbChatConversationMcpRead, dbChatConversationMcpSearch } from '@/storage/conversation/conversation.mcp-search';

export const searchChatConversationsForMcp = async (filter: unknown): Promise<Page<ChatConversationMcpListItem>> => {
  const validated = chatConversationMcpFilterSchema.parse(filter);
  return dbChatConversationMcpSearch(validated);
};

export const readChatConversationForMcp = async (id: string): Promise<ChatConversationMcpDetail | null> => {
  return dbChatConversationMcpRead(id);
};
