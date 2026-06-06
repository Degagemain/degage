import { readChatConversationForAdmin } from '@/actions/conversation/admin-read';
import { type IdRouteParams, getIdFromRoute, notFoundResponse } from '@/api/utils';
import { withAdmin } from '@/api/with-context';

export const GET = withAdmin(async (_request, context) => {
  const id = await getIdFromRoute(context as IdRouteParams);
  const conversation = await readChatConversationForAdmin(id);
  if (!conversation) {
    return notFoundResponse();
  }
  return Response.json(conversation);
});
