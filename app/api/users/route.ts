import { NextRequest } from 'next/server';
import { userFilterSchema } from '@/domain/user.filter';
import { searchUsers } from '@/actions/user/search';
import { errorResponseIfNotAdmin } from '@/api/authorization-utils';
import { badRequestResponseFromZod } from '@/api/utils';

export async function GET(request: NextRequest) {
  const denied = await errorResponseIfNotAdmin();
  if (denied) return denied;

  const userFilter = userFilterSchema.safeParse(Object.fromEntries(request.nextUrl.searchParams));
  if (!userFilter.success) {
    return badRequestResponseFromZod(userFilter);
  }

  const result = await searchUsers(userFilter.data);
  return Response.json(result);
}
