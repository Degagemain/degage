import type { NextRequest } from 'next/server';
import { readChatConversation } from '@/actions/conversation/read';
import type { IdRouteParams } from '@/api/utils';
import { getIdFromRoute, notFoundResponse } from '@/api/utils';
import { withPublic } from '@/api/with-context';

export const GET = withPublic(async (request: NextRequest, context, session) => {
  const id = await getIdFromRoute(context as IdRouteParams);
  const guestToken = request.nextUrl.searchParams.get('guestToken')?.trim() ?? '';
  if (!guestToken) {
    return notFoundResponse('Conversation not found');
  }

  const conversation = await readChatConversation(id, session?.user ?? null, { guestToken });
  if (!conversation) {
    return notFoundResponse('Conversation not found');
  }

  return Response.json({
    ...conversation,
    guestToken: undefined,
  });
});
