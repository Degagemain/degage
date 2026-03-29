import type { NextRequest } from 'next/server';
import { headers } from 'next/headers';
import { z } from 'zod';
import { auth } from '@/auth';
import { readChatConversation } from '@/actions/conversation/read';
import { createMessage } from '@/actions/conversation/message/create';
import type { IdRouteParams } from '@/api/utils';
import { forbiddenResponse, getIdFromRoute, notFoundResponse, safeParseRequestJson, unauthorizedResponse } from '@/api/utils';
import { withContext } from '@/api/with-context';
import { isAdmin } from '@/domain/role.utils';
import { chatUserMessageMaxLength } from '@/domain/chat.model';

const citationSchema = z.object({
  documentationId: z.uuid(),
  externalId: z.string().min(1),
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

export const POST = withContext(async (request: NextRequest, context?: { params: Promise<Record<string, string>> }) => {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) {
    return unauthorizedResponse();
  }

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
