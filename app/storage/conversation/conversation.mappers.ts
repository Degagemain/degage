import type {
  ChatCitation,
  ChatConversation,
  ChatConversationAdminDetail,
  ChatConversationListItem,
  ChatConversationUpdateInput,
  ChatMessage,
} from '@/domain/chat.model';
import type { Prisma } from '@/storage/client/client';

type DbChatMessage = Prisma.ChatMessageGetPayload<Record<string, never>>;
type DbChatConversation = Prisma.ChatConversationGetPayload<{
  include: { messages: true };
}>;

type DbChatConversationWithUser = Prisma.ChatConversationGetPayload<{
  include: { user: true };
}>;

type DbChatConversationWithUserAndMessages = Prisma.ChatConversationGetPayload<{
  include: { user: true; messages: true };
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
    guestToken: conversation.guestToken,
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

const dbUserToIdName = (user: NonNullable<DbChatConversationWithUser['user']>) => ({
  id: user.id,
  name: user.name?.trim() || user.email,
});

export const dbChatConversationToListItem = (conversation: DbChatConversationWithUser): ChatConversationListItem => {
  return {
    id: conversation.id,
    title: conversation.title,
    medium: conversation.medium,
    user: conversation.user ? dbUserToIdName(conversation.user) : null,
    updatedAt: conversation.updatedAt,
  };
};

export const dbChatConversationToAdminDetail = (conversation: DbChatConversationWithUserAndMessages): ChatConversationAdminDetail => {
  const domain = dbChatConversationToDomain(conversation);
  const { guestToken: _guestToken, userId: _userId, ...rest } = domain;
  return {
    ...rest,
    user: conversation.user ? dbUserToIdName(conversation.user) : null,
  };
};
