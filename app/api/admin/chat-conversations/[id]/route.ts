import { readChatConversation } from '@/actions/conversation/read';
import type { IdRouteParams } from '@/api/utils';
import { getIdFromRoute, notFoundResponse } from '@/api/utils';
import { withAdmin } from '@/api/with-context';

export const GET = withAdmin(async (_request, context, session) => {
  const id = await getIdFromRoute(context as IdRouteParams);
  const conversation = await readChatConversation(id, session.user);
  if (!conversation) {
    return notFoundResponse('Conversation not found');
  }

  return Response.json(conversation);
});
