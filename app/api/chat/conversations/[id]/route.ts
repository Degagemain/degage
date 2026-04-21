import { deleteChatConversation } from '@/actions/conversation/delete';
import { readChatConversation } from '@/actions/conversation/read';
import type { IdRouteParams } from '@/api/utils';
import { getIdFromRoute, noContentResponse, notFoundResponse } from '@/api/utils';
import { withAuth } from '@/api/with-context';

export const GET = withAuth(async (_request, context, session) => {
  const id = await getIdFromRoute(context as IdRouteParams);
  const conversation = await readChatConversation(id, session.user);
  if (!conversation) {
    return notFoundResponse('Conversation not found');
  }

  return Response.json(conversation);
});

export const DELETE = withAuth(async (_request, context, session) => {
  const id = await getIdFromRoute(context as IdRouteParams);
  const deleted = await deleteChatConversation(id, session.user);
  if (!deleted) {
    return notFoundResponse('Conversation not found');
  }

  return noContentResponse();
});
