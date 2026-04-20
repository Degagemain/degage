import { type NextRequest } from 'next/server';
import { searchFiscalRegions } from '@/actions/fiscal-region/search';
import { createFiscalRegion } from '@/actions/fiscal-region/create';
import { fiscalRegionFilterSchema } from '@/domain/fiscal-region.filter';
import { badRequestResponseFromZod, safeParseRequestJson, tryCreateResource } from '@/api/utils';
import { withAdmin } from '@/api/with-context';

export const GET = withAdmin(async (request: NextRequest) => {
  const fiscalRegionFilter = fiscalRegionFilterSchema.safeParse(Object.fromEntries(request.nextUrl.searchParams));
  if (!fiscalRegionFilter.success) {
    return badRequestResponseFromZod(fiscalRegionFilter);
  }

  const result = await searchFiscalRegions(fiscalRegionFilter.data);
  return Response.json(result);
});

export const POST = withAdmin(async (request: NextRequest) => {
  const { data, errorResponse } = await safeParseRequestJson(request);
  if (errorResponse) return errorResponse;
  return tryCreateResource(createFiscalRegion, data);
});
