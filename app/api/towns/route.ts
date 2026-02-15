import { type NextRequest } from 'next/server';
import { headers } from 'next/headers';
import { auth } from '@/auth';
import { isAdmin } from '@/domain/role.utils';
import { searchTowns } from '@/actions/town/search';
import { createTown } from '@/actions/town/create';
import { townFilterSchema } from '@/domain/town.filter';
import { forbiddenResponse, fromZodParseResult, safeParseRequestJson, tryCreateResource, unauthorizedResponse } from '@/api/utils';
import { withContext } from '@/api/with-context';

export const GET = withContext(async (request: NextRequest) => {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user) {
    return unauthorizedResponse();
  }

  const filter = townFilterSchema.safeParse(Object.fromEntries(request.nextUrl.searchParams));
  if (!filter.success) {
    return fromZodParseResult(filter);
  }

  const result = await searchTowns(filter.data);
  const displayLabel = (t: { zip: string; name: string; municipality: string }) =>
    t.name !== t.municipality ? `${t.zip} ${t.name} (${t.municipality})` : `${t.zip} ${t.name}`;
  const recordsWithLabel = result.records.map((t) => ({ ...t, displayLabel: displayLabel(t) }));
  return Response.json({ ...result, records: recordsWithLabel });
});

export const POST = withContext(async (request: NextRequest) => {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user) {
    return unauthorizedResponse();
  }

  if (!isAdmin(session.user)) {
    return forbiddenResponse('Admin access required');
  }

  const { data, errorResponse } = await safeParseRequestJson(request);
  if (errorResponse) return errorResponse;
  return tryCreateResource(createTown, data);
});
