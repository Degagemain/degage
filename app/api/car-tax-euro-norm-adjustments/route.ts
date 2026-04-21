import { type NextRequest } from 'next/server';
import { searchCarTaxEuroNormAdjustments } from '@/actions/car-tax-euro-norm-adjustment/search';
import { createCarTaxEuroNormAdjustment } from '@/actions/car-tax-euro-norm-adjustment/create';
import { carTaxEuroNormAdjustmentFilterSchema } from '@/domain/car-tax-euro-norm-adjustment.filter';
import { badRequestResponseFromZod, safeParseRequestJson, tryCreateResource } from '@/api/utils';
import { withAdmin } from '@/api/with-context';

export const GET = withAdmin(async (request: NextRequest) => {
  const filter = carTaxEuroNormAdjustmentFilterSchema.safeParse(Object.fromEntries(request.nextUrl.searchParams));
  if (!filter.success) {
    return badRequestResponseFromZod(filter);
  }

  const result = await searchCarTaxEuroNormAdjustments(filter.data);
  return Response.json(result);
});

export const POST = withAdmin(async (request: NextRequest) => {
  const { data, errorResponse } = await safeParseRequestJson(request);
  if (errorResponse) return errorResponse;
  return tryCreateResource(createCarTaxEuroNormAdjustment, data);
});
