import type { NextRequest } from 'next/server';
import { searchAdminChatConversations } from '@/actions/conversation/search-admin';
import { badRequestResponseFromZod } from '@/api/utils';
import { withAdmin } from '@/api/with-context';
import { adminConversationFilterSchema } from '@/domain/conversation.filter';

export const GET = withAdmin(async (request: NextRequest) => {
  const filter = adminConversationFilterSchema.safeParse(Object.fromEntries(request.nextUrl.searchParams));
  if (!filter.success) {
    return badRequestResponseFromZod(filter);
  }

  const result = await searchAdminChatConversations(filter.data);
  return Response.json(result);
});
