import type { NextRequest } from 'next/server';
import { z } from 'zod';
import { type UIMessage } from 'ai';
import { createChatConversation } from '@/actions/conversation/create';
import { readChatConversation } from '@/actions/conversation/read';
import { readChatConversationByGuestToken } from '@/actions/conversation/read-by-guest-token';
import { updateChatConversation } from '@/actions/conversation/update';
import { createMessage } from '@/actions/conversation/message/create';
import { generateSupportReplyStream } from '@/actions/support/generate-reply';
import { forbiddenResponse, notFoundResponse, safeParseRequestJson } from '@/api/utils';
import { withPublic } from '@/api/with-context';
import { isAdmin } from '@/domain/role.utils';
import { type ChatCitation, chatUserMessageMaxLength } from '@/domain/chat.model';
import { type DocumentationAudienceRole, documentationAudienceRoleSchema } from '@/domain/documentation.model';

export const maxDuration = 30;

const getMessageText = (message: UIMessage): string => {
  return message.parts
    .filter((part) => part.type === 'text')
    .map((part) => part.text)
    .join('\n')
    .trim();
};

const toUiMessagesFromStoredConversation = (
  messages: Array<{
    id: string | null;
    externalId: string | null;
    role: 'user' | 'assistant';
    content: string;
  }>,
): UIMessage[] => {
  return messages.map((message) => ({
    id: message.externalId || message.id || crypto.randomUUID(),
    role: message.role,
    parts: [{ type: 'text', text: message.content }],
  }));
};

// Chat supports both anonymous visitors (public support widget) and authenticated users.
// Anonymous frontend conversations are persisted after the first message using a guest token.
export const POST = withPublic(async (request: NextRequest, _context, session) => {
  const user = session?.user;
  const isAuthenticated = Boolean(user?.id);

  const { data, errorResponse } = await safeParseRequestJson(request);
  if (errorResponse) return errorResponse;

  const raw = (data ?? {}) as Record<string, unknown>;
  const conversationIdRaw = typeof raw.conversationId === 'string' ? raw.conversationId : null;
  const guestTokenRaw = typeof raw.guestToken === 'string' ? raw.guestToken.trim() : '';

  const conversationIdResult = conversationIdRaw ? z.uuid().safeParse(conversationIdRaw) : null;
  if (conversationIdRaw && (!conversationIdResult || !conversationIdResult.success)) {
    return Response.json(
      {
        code: 'validation_error',
        errors: [{ message: 'conversationId must be a UUID when provided' }],
      },
      { status: 400 },
    );
  }

  const conversationId = conversationIdResult?.success ? conversationIdResult.data : null;

  let previewAudience: DocumentationAudienceRole | undefined = undefined;
  const previewAudienceRaw = raw.previewAudience;
  if (previewAudienceRaw !== undefined && previewAudienceRaw !== null) {
    const parsed = documentationAudienceRoleSchema.safeParse(previewAudienceRaw);
    if (!parsed.success) {
      return Response.json(
        {
          code: 'validation_error',
          errors: [{ message: 'previewAudience must be admin, user, or public when provided' }],
        },
        { status: 400 },
      );
    }
    previewAudience = parsed.data;
  }

  let resolvedConversationId: string | null = null;
  let resolvedGuestToken: string | null = null;
  let existingConversationMessages: Array<{
    id: string | null;
    externalId: string | null;
    role: 'user' | 'assistant';
    content: string;
  }> = [];

  if (isAuthenticated && user?.id) {
    const existingConversation = conversationId ? await readChatConversation(conversationId, user) : null;
    if (conversationId && !existingConversation) {
      return notFoundResponse('Conversation not found');
    }
    if (existingConversation?.userId && existingConversation.userId !== user.id && !isAdmin(user)) {
      return forbiddenResponse('Access denied');
    }

    const conversation = existingConversation ?? (await createChatConversation({ userId: user.id, title: '', medium: 'frontend' }));
    resolvedConversationId = conversation.id;
    existingConversationMessages = conversation.messages;
    if (!resolvedConversationId) {
      return Response.json(
        {
          code: 'internal_error',
          errors: [{ message: 'Conversation ID is missing' }],
        },
        { status: 500 },
      );
    }
  } else if (conversationId) {
    if (!guestTokenRaw) {
      return forbiddenResponse('Access denied');
    }

    const existingConversation = await readChatConversation(conversationId, null, { guestToken: guestTokenRaw });
    if (!existingConversation) {
      return notFoundResponse('Conversation not found');
    }

    resolvedConversationId = existingConversation.id;
    resolvedGuestToken = existingConversation.guestToken;
    existingConversationMessages = existingConversation.messages;
  } else if (!isAuthenticated && guestTokenRaw) {
    const existingConversation = await readChatConversationByGuestToken(guestTokenRaw);
    if (!existingConversation) {
      return notFoundResponse('Conversation not found');
    }

    resolvedConversationId = existingConversation.id;
    resolvedGuestToken = existingConversation.guestToken;
    existingConversationMessages = existingConversation.messages;
  }

  const directMessages = Array.isArray(raw.messages) ? (raw.messages as UIMessage[]) : [];
  const singleMessage = raw.message && typeof raw.message === 'object' ? (raw.message as UIMessage) : null;
  const baseMessages = resolvedConversationId ? toUiMessagesFromStoredConversation(existingConversationMessages) : [];
  const messages = directMessages.length > 0 ? directMessages : singleMessage ? [...baseMessages, singleMessage] : baseMessages;

  const lastUserMessage = [...messages].reverse().find((message) => message.role === 'user');
  if (lastUserMessage) {
    const text = getMessageText(lastUserMessage);
    if (text) {
      if (text.length > chatUserMessageMaxLength) {
        return Response.json(
          {
            code: 'validation_error',
            errors: [
              {
                message: `Message must be at most ${String(chatUserMessageMaxLength)} characters`,
              },
            ],
          },
          { status: 400 },
        );
      }

      if (!resolvedConversationId) {
        if (!isAuthenticated && guestTokenRaw) {
          return notFoundResponse('Conversation not found');
        }

        const guestToken = crypto.randomUUID();
        const conversation = await createChatConversation({
          userId: null,
          guestToken,
          title: text.slice(0, 80),
          medium: 'frontend',
        });
        resolvedConversationId = conversation.id;
        resolvedGuestToken = guestToken;
        existingConversationMessages = [];
      }

      if (resolvedConversationId) {
        await createMessage({
          conversationId: resolvedConversationId,
          externalId: lastUserMessage.id,
          role: 'user',
          content: text,
        });
      }
      if (resolvedConversationId && existingConversationMessages.length === 0) {
        await updateChatConversation(resolvedConversationId, { title: text.slice(0, 80) });
      }
    }
  }

  const userLocaleRaw = (user as { locale?: unknown } | undefined)?.locale;
  const userLocale = typeof userLocaleRaw === 'string' ? userLocaleRaw.trim() : '';
  const audienceOverride = isAuthenticated && user && isAdmin(user) ? previewAudience : undefined;
  const { result, getLatestCitations } = await generateSupportReplyStream(messages, {
    viewer: user ?? null,
    audienceOverride,
    includeCitations: true,
    outputFormat: 'markdown',
    replyStyle: 'chat',
    userLocale,
    onFinish: async ({ text, citations }) => {
      if (!resolvedConversationId) return;
      const assistantText = text.trim();
      if (!assistantText) return;
      await createMessage({
        conversationId: resolvedConversationId,
        role: 'assistant',
        content: assistantText,
        citations,
      });
    },
  });

  let latestCitations: ChatCitation[] = [];
  return result.toUIMessageStreamResponse({
    messageMetadata: ({ part }) => {
      if (part.type === 'finish') {
        latestCitations = getLatestCitations();
        if (!resolvedConversationId) {
          return { citations: latestCitations };
        }
        return resolvedGuestToken
          ? { conversationId: resolvedConversationId, guestToken: resolvedGuestToken, citations: latestCitations }
          : { conversationId: resolvedConversationId, citations: latestCitations };
      }
      return undefined;
    },
  });
});
