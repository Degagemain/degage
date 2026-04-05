import { type NextRequest } from 'next/server';
import { headers } from 'next/headers';
import { auth } from '@/auth';
import { searchEuroNorms } from '@/actions/euro-norm/search';
import { createEuroNorm } from '@/actions/euro-norm/create';
import { euroNormFilterSchema } from '@/domain/euro-norm.filter';
import { errorResponseIfNotAdmin } from '@/api/authorization-utils';
import { badRequestResponseFromZod, safeParseRequestJson, tryCreateResource, unauthorizedResponse } from '@/api/utils';
import { withContext } from '@/api/with-context';

export const GET = withContext(async (request: NextRequest) => {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user) {
    return unauthorizedResponse();
  }

  const euroNormFilter = euroNormFilterSchema.safeParse(Object.fromEntries(request.nextUrl.searchParams));
  if (!euroNormFilter.success) {
    return badRequestResponseFromZod(euroNormFilter);
  }

  const result = await searchEuroNorms(euroNormFilter.data);
  return Response.json(result);
});

export const POST = withContext(async (request: NextRequest) => {
  const denied = await errorResponseIfNotAdmin();
  if (denied) return denied;

  const { data, errorResponse } = await safeParseRequestJson(request);
  if (errorResponse) return errorResponse;
  return tryCreateResource(createEuroNorm, data);
});
