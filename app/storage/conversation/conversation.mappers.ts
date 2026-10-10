import { assistantTurnIsDocumentationGap } from '@/domain/chat-conversation-gap';
import type { ChatConversationMcpDetail, ChatConversationMcpListItem, ChatConversationMcpMessage } from '@/domain/chat-conversation-mcp.model';
import type {
  ChatCitation,
  ChatConversation,
  ChatConversationAdminDetail,
  ChatConversationListItem,
  ChatConversationMedium,
  ChatConversationUpdateInput,
  ChatMessage,
} from '@/domain/chat.model';
import { chatConversationMediumToChannel } from '@/domain/chat.model';
import { externalIdFromChatCitation } from '@/domain/documentation.support-citations';
import { isContentLocale } from '@/i18n/locales';
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
      const rawExternalId = 'externalId' in citation && typeof citation.externalId === 'string' ? citation.externalId : null;
      const externalId = externalIdFromChatCitation({ externalId: rawExternalId, url });
      return externalId ? { title, url, externalId } : { title, url };
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
    locale: conversation.locale && isContentLocale(conversation.locale) ? conversation.locale : null,
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

export type ChatConversationMcpSourceMessage = {
  id: string;
  role: string;
  content?: string;
  citations: unknown;
  noResults: boolean | null;
  createdAt: Date;
};

export type ChatConversationMcpSource = {
  id: string;
  title: string;
  medium: ChatConversationMedium;
  locale: string | null;
  createdAt: Date;
  updatedAt: Date;
  user: { locale: string | null } | null;
  messages: ChatConversationMcpSourceMessage[];
};

const resolveMcpLocale = (conversation: Pick<ChatConversationMcpSource, 'locale' | 'user'>): ChatConversationMcpListItem['locale'] => {
  if (conversation.locale && isContentLocale(conversation.locale)) return conversation.locale;
  const userLocale = conversation.user?.locale;
  if (userLocale && isContentLocale(userLocale)) return userLocale;
  return null;
};

const toMcpCitations = (value: unknown): ChatConversationMcpDetail['messages'][number]['citations'] => {
  if (!Array.isArray(value)) return [];
  return value.flatMap((item) => {
    if (!item || typeof item !== 'object') return [];
    const record = item as { title?: unknown; url?: unknown; externalId?: unknown };
    const title = typeof record.title === 'string' ? record.title.trim() : '';
    if (!title) return [];
    const url = typeof record.url === 'string' ? record.url : '';
    return [
      {
        externalId: externalIdFromChatCitation({
          externalId: typeof record.externalId === 'string' ? record.externalId : null,
          url,
        }),
        title,
      },
    ];
  });
};

export const toChatConversationMcpListItem = (conversation: ChatConversationMcpSource): ChatConversationMcpListItem => {
  return {
    id: conversation.id,
    title: conversation.title,
    channel: chatConversationMediumToChannel(conversation.medium),
    locale: resolveMcpLocale(conversation),
    noResults: conversation.messages.some((message) => assistantTurnIsDocumentationGap(message, conversation.medium)),
    createdAt: conversation.createdAt,
    updatedAt: conversation.updatedAt,
  };
};

export const toChatConversationMcpDetail = (conversation: ChatConversationMcpSource): ChatConversationMcpDetail => {
  return {
    ...toChatConversationMcpListItem(conversation),
    messages: conversation.messages.map(
      (message): ChatConversationMcpMessage => ({
        id: message.id,
        role: message.role === 'assistant' ? 'assistant' : 'user',
        content: message.content ?? '',
        createdAt: message.createdAt,
        citations: message.role === 'assistant' ? toMcpCitations(message.citations) : [],
      }),
    ),
  };
};
