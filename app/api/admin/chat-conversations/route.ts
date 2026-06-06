import { type NextRequest } from 'next/server';
import { searchChatConversationsForAdmin } from '@/actions/conversation/admin-search';
import { chatConversationAdminFilterSchema } from '@/domain/chat-conversation-admin.filter';
import { badRequestResponseFromZod } from '@/api/utils';
import { withAdmin } from '@/api/with-context';

const filterInputFromSearchParams = (searchParams: URLSearchParams): Record<string, unknown> => ({
  userIds: searchParams.get('userIds') ?? undefined,
  skip: searchParams.get('skip') ?? undefined,
  take: searchParams.get('take') ?? undefined,
  sortBy: searchParams.get('sortBy') ?? undefined,
  sortOrder: searchParams.get('sortOrder') ?? undefined,
});

export const GET = withAdmin(async (request: NextRequest) => {
  const filter = chatConversationAdminFilterSchema.safeParse(filterInputFromSearchParams(request.nextUrl.searchParams));
  if (!filter.success) {
    return badRequestResponseFromZod(filter);
  }

  const result = await searchChatConversationsForAdmin(filter.data);
  return Response.json(result);
});
