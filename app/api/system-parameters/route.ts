import { type NextRequest } from 'next/server';
import { searchSystemParameters } from '@/actions/system-parameter/list';
import { systemParameterFilterSchema } from '@/domain/system-parameter.filter';
import { badRequestResponseFromZod } from '@/api/utils';
import { withAdmin } from '@/api/with-context';

export const GET = withAdmin(async (request: NextRequest) => {
  const filter = systemParameterFilterSchema.safeParse(Object.fromEntries(request.nextUrl.searchParams));
  if (!filter.success) {
    return badRequestResponseFromZod(filter);
  }

  const result = await searchSystemParameters(filter.data);
  return Response.json(result);
});
