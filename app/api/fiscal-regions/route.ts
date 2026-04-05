import { type NextRequest } from 'next/server';
import { searchFiscalRegions } from '@/actions/fiscal-region/search';
import { createFiscalRegion } from '@/actions/fiscal-region/create';
import { fiscalRegionFilterSchema } from '@/domain/fiscal-region.filter';
import { errorResponseIfNotAdmin } from '@/api/authorization-utils';
import { badRequestResponseFromZod, safeParseRequestJson, tryCreateResource } from '@/api/utils';
import { withContext } from '@/api/with-context';

export const GET = withContext(async (request: NextRequest) => {
  const denied = await errorResponseIfNotAdmin();
  if (denied) return denied;

  const fiscalRegionFilter = fiscalRegionFilterSchema.safeParse(Object.fromEntries(request.nextUrl.searchParams));
  if (!fiscalRegionFilter.success) {
    return badRequestResponseFromZod(fiscalRegionFilter);
  }

  const result = await searchFiscalRegions(fiscalRegionFilter.data);
  return Response.json(result);
});

export const POST = withContext(async (request: NextRequest) => {
  const denied = await errorResponseIfNotAdmin();
  if (denied) return denied;

  const { data, errorResponse } = await safeParseRequestJson(request);
  if (errorResponse) return errorResponse;
  return tryCreateResource(createFiscalRegion, data);
});
