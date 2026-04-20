import { type NextRequest } from 'next/server';
import { searchEuroNorms } from '@/actions/euro-norm/search';
import { createEuroNorm } from '@/actions/euro-norm/create';
import { euroNormFilterSchema } from '@/domain/euro-norm.filter';
import { badRequestResponseFromZod, safeParseRequestJson, tryCreateResource } from '@/api/utils';
import { withAdmin, withAuth } from '@/api/with-context';

export const GET = withAuth(async (request: NextRequest) => {
  const euroNormFilter = euroNormFilterSchema.safeParse(Object.fromEntries(request.nextUrl.searchParams));
  if (!euroNormFilter.success) {
    return badRequestResponseFromZod(euroNormFilter);
  }

  const result = await searchEuroNorms(euroNormFilter.data);
  return Response.json(result);
});

export const POST = withAdmin(async (request: NextRequest) => {
  const { data, errorResponse } = await safeParseRequestJson(request);
  if (errorResponse) return errorResponse;
  return tryCreateResource(createEuroNorm, data);
});
