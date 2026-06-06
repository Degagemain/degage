import { readChatConversationForAdmin } from '@/actions/conversation/admin-read';
import { notFoundResponse } from '@/api/utils';
import { withAdmin } from '@/api/with-context';

export const GET = withAdmin(async (_request, context) => {
  const { id } = await context.params;
  const conversation = await readChatConversationForAdmin(id);
  if (!conversation) {
    return notFoundResponse();
  }
  return Response.json(conversation);
});
