import { type NextRequest } from 'next/server';
import { searchTowns } from '@/actions/town/search';
import { createTown } from '@/actions/town/create';
import { townFilterSchema } from '@/domain/town.filter';
import { badRequestResponseFromZod, safeParseRequestJson, tryCreateResource } from '@/api/utils';
import { withAdmin, withPublic } from '@/api/with-context';

export const GET = withPublic(async (request: NextRequest) => {
  const filter = townFilterSchema.safeParse(Object.fromEntries(request.nextUrl.searchParams));
  if (!filter.success) {
    return badRequestResponseFromZod(filter);
  }

  const result = await searchTowns(filter.data);
  const displayLabel = (t: { zip: string; name: string; municipality: string }) =>
    t.name !== t.municipality ? `${t.zip} ${t.name} (${t.municipality})` : `${t.zip} ${t.name}`;
  const recordsWithLabel = result.records.map((t) => ({ ...t, displayLabel: displayLabel(t) }));
  return Response.json({ ...result, records: recordsWithLabel });
});

export const POST = withAdmin(async (request: NextRequest) => {
  const { data, errorResponse } = await safeParseRequestJson(request);
  if (errorResponse) return errorResponse;
  return tryCreateResource(createTown, data);
});
