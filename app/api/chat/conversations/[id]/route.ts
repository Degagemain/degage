import type { NextRequest } from 'next/server';
import { headers } from 'next/headers';
import { auth } from '@/auth';
import { deleteChatConversation } from '@/actions/conversation/delete';
import { readChatConversation } from '@/actions/conversation/read';
import type { IdRouteParams } from '@/api/utils';
import { getIdFromRoute, noContentResponse, notFoundResponse, unauthorizedResponse } from '@/api/utils';
import { withContext } from '@/api/with-context';

export const GET = withContext(async (_request: NextRequest, context?: { params: Promise<Record<string, string>> }) => {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) {
    return unauthorizedResponse();
  }

  const id = await getIdFromRoute(context as IdRouteParams);
  const conversation = await readChatConversation(id, session.user);
  if (!conversation) {
    return notFoundResponse('Conversation not found');
  }

  return Response.json(conversation);
});

export const DELETE = withContext(async (_request: NextRequest, context?: { params: Promise<Record<string, string>> }) => {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) {
    return unauthorizedResponse();
  }

  const id = await getIdFromRoute(context as IdRouteParams);
  const deleted = await deleteChatConversation(id, session.user);
  if (!deleted) {
    return notFoundResponse('Conversation not found');
  }

  return noContentResponse();
});
