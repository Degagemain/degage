import { type NextRequest } from 'next/server';
import { userFilterSchema } from '@/domain/user.filter';
import { searchUsers } from '@/actions/user/search';
import { badRequestResponseFromZod } from '@/api/utils';
import { withAdmin } from '@/api/with-context';

export const GET = withAdmin(async (request: NextRequest) => {
  const userFilter = userFilterSchema.safeParse(Object.fromEntries(request.nextUrl.searchParams));
  if (!userFilter.success) {
    return badRequestResponseFromZod(userFilter);
  }

  const result = await searchUsers(userFilter.data);
  return Response.json(result);
});
