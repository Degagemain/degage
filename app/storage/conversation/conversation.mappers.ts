import type { ChatCitation, ChatConversation, ChatConversationUpdateInput, ChatMessage } from '@/domain/chat.model';
import type { Prisma } from '@/storage/client/client';

type DbChatMessage = Prisma.ChatMessageGetPayload<Record<string, never>>;
type DbChatConversation = Prisma.ChatConversationGetPayload<{
  include: { messages: true };
}>;

const parseCitations = (value: unknown): ChatCitation[] => {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => {
      if (!item || typeof item !== 'object') return null;
      const citation = item as Partial<ChatCitation>;
      const title = typeof citation.title === 'string' ? citation.title : '';
      const url = typeof citation.url === 'string' ? citation.url : '';
      if (!title || !url) {
        return null;
      }
      return { title, url };
    })
    .filter((item): item is ChatCitation => item !== null);
};

export const dbChatMessageToDomain = (message: DbChatMessage): ChatMessage => {
  return {
    id: message.id,
    conversationId: message.conversationId,
    externalId: message.externalId,
    externalMessageId: message.externalMessageId,
    role: message.role === 'assistant' ? 'assistant' : 'user',
    content: message.content,
    citations: parseCitations(message.citations),
    createdAt: message.createdAt,
  };
};

export const dbChatConversationToDomain = (conversation: DbChatConversation): ChatConversation => {
  return {
    id: conversation.id,
    userId: conversation.userId,
    medium: conversation.medium,
    emailThreadId: conversation.emailThreadId,
    title: conversation.title,
    messages: conversation.messages.map(dbChatMessageToDomain),
    createdAt: conversation.createdAt,
    updatedAt: conversation.updatedAt,
  };
};

export const chatConversationUpdateToDb = (input: ChatConversationUpdateInput): Prisma.ChatConversationUpdateInput => {
  return {
    title: input.title.trim(),
  };
};
