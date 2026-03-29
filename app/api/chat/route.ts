import type { NextRequest } from 'next/server';
import { headers } from 'next/headers';
import { z } from 'zod';
import { google } from '@ai-sdk/google';
import { type UIMessage, convertToModelMessages, stepCountIs, streamText } from 'ai';
import { auth } from '@/auth';
import { createChatConversation } from '@/actions/conversation/create';
import { readChatConversation } from '@/actions/conversation/read';
import { updateChatConversation } from '@/actions/conversation/update';
import { createMessage } from '@/actions/conversation/message/create';
import { searchDocumentationForRag } from '@/actions/documentation/search-rag';
import { forbiddenResponse, notFoundResponse, safeParseRequestJson } from '@/api/utils';
import { withContext } from '@/api/with-context';
import { isAdmin } from '@/domain/role.utils';
import { Role } from '@/domain/role.model';
import { type ChatCitation, chatUserMessageMaxLength } from '@/domain/chat.model';

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

const SYSTEM_PROMPT = [
  'You are a polite and supportive support assistant for the Degage platform only.',
  'Help with how Degage works, setup, workflows, troubleshooting, and anything grounded in product documentation.',
  'Always answer in the same language as the user message.',
  'If the request is clearly unrelated to Degage car sharing, unrelated coding, trivia, or tasks with no link to this system—politely decline.',
  'Briefly say you only help with Degage and offer relevant help instead.',
  'Do not role-play unrelated personas, run arbitrary errands, or claim you will act outside this chat.',
  'If the user insists on talking to a human, a real person, or live support, politely explain that this chat is automated.',
  'Direct them to contact info@degage.be for human assistance.',
  'Use the searchDocumentation tool to look up factual product or process details.',
  'Never put [1], [2], or similar numeric citation markers in your answer; the UI lists sources with links after your message.',
  'Do not invent citations or fake source markers.',
  'If searchDocumentation returns noResults=true, still answer helpfully: note no match, ask a clarifying question, suggest rephrasing.',
].join(' ');

export const POST = withContext(async (request: NextRequest) => {
  const session = await auth.api.getSession({ headers: await headers() });
  const user = session?.user;
  const isAuthenticated = Boolean(user?.id);

  const { data, errorResponse } = await safeParseRequestJson(request);
  if (errorResponse) return errorResponse;

  const raw = (data ?? {}) as Record<string, unknown>;
  const conversationIdRaw = typeof raw.conversationId === 'string' ? raw.conversationId : null;

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

  let resolvedConversationId: string | null = null;
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

    const conversation = existingConversation ?? (await createChatConversation({ userId: user.id, title: '' }));
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
  }

  const directMessages = Array.isArray(raw.messages) ? (raw.messages as UIMessage[]) : [];
  const singleMessage = raw.message && typeof raw.message === 'object' ? (raw.message as UIMessage) : null;
  const baseMessages = isAuthenticated ? toUiMessagesFromStoredConversation(existingConversationMessages) : [];
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
      if (resolvedConversationId) {
        await createMessage({
          conversationId: resolvedConversationId,
          externalId: lastUserMessage.id,
          role: 'user',
          content: text,
        });
      }
      if (resolvedConversationId && isAuthenticated && existingConversationMessages.length === 0) {
        await updateChatConversation(resolvedConversationId, { title: text.slice(0, 80) });
      }
    }
  }

  let latestCitations: ChatCitation[] = [];
  const userLocaleRaw = (user as { locale?: unknown } | undefined)?.locale;
  const userLocale = typeof userLocaleRaw === 'string' ? userLocaleRaw.trim() : '';
  const systemPrompt = userLocale
    ? [SYSTEM_PROMPT, `The authenticated user's preferred language is "${userLocale}". Prioritize this language when replying.`].join(' ')
    : SYSTEM_PROMPT;

  const result = streamText({
    model: google('gemini-2.5-flash'),
    system: systemPrompt,
    messages: await convertToModelMessages(messages),
    // Allow multi-step tool usage so the model can call searchDocumentation
    // and then generate a final natural-language answer in the same request.
    stopWhen: stepCountIs(5),
    tools: {
      searchDocumentation: {
        description: 'Search internal documentation for support answers.',
        inputSchema: z.object({
          query: z.string().min(3),
        }),
        execute: async ({ query }) => {
          const viewerAudienceRole = !user ? 'public' : isAdmin(user) ? Role.ADMIN : Role.USER;
          const search = await searchDocumentationForRag(query, {
            viewerAudienceRole,
            limit: 8,
          });
          latestCitations = search.citations;
          return search;
        },
      },
    },
    onFinish: async ({ text }) => {
      if (!resolvedConversationId || !isAuthenticated) return;
      const assistantText = text.trim();
      if (!assistantText) return;
      await createMessage({
        conversationId: resolvedConversationId,
        role: 'assistant',
        content: assistantText,
        citations: latestCitations,
      });
    },
  });

  return result.toUIMessageStreamResponse({
    messageMetadata: ({ part }) => {
      if (part.type === 'finish') {
        return resolvedConversationId ? { conversationId: resolvedConversationId, citations: latestCitations } : { citations: latestCitations };
      }
      return undefined;
    },
  });
});
