import type { NextRequest } from 'next/server';
import { z } from 'zod';
import { readChatConversation } from '@/actions/conversation/read';
import { createMessage } from '@/actions/conversation/message/create';
import type { IdRouteParams } from '@/api/utils';
import { forbiddenResponse, getIdFromRoute, notFoundResponse, safeParseRequestJson } from '@/api/utils';
import { withAuth } from '@/api/with-context';
import { isAdmin } from '@/domain/role.utils';
import { chatUserMessageMaxLength } from '@/domain/chat.model';

const citationSchema = z.object({
  title: z.string().min(1),
  url: z.string().min(1),
});

const appendSchema = z.object({
  externalId: z.string().min(1).optional(),
  externalMessageId: z.string().min(1).optional(),
  role: z.enum(['user', 'assistant']),
  content: z.string().min(1).max(chatUserMessageMaxLength),
  citations: z.array(citationSchema).optional().default([]),
});

export const POST = withAuth(async (request: NextRequest, context, session) => {
  const conversationId = await getIdFromRoute(context as IdRouteParams);
  const conversation = await readChatConversation(conversationId, session.user);
  if (!conversation) {
    return notFoundResponse('Conversation not found');
  }
  if (conversation.userId && conversation.userId !== session.user.id && !isAdmin(session.user)) {
    return forbiddenResponse('Access denied');
  }

  const { data, errorResponse } = await safeParseRequestJson(request);
  if (errorResponse) return errorResponse;

  const parsed = appendSchema.safeParse(data);
  if (!parsed.success) {
    return Response.json({ code: 'validation_error', errors: parsed.error.issues }, { status: 400 });
  }

  await createMessage({
    conversationId,
    externalId: parsed.data.externalId ?? null,
    externalMessageId: parsed.data.externalMessageId ?? null,
    role: parsed.data.role,
    content: parsed.data.content,
    citations: parsed.data.citations,
  });

  return Response.json({ ok: true }, { status: 201 });
});
