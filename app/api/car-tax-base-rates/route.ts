import { type NextRequest } from 'next/server';
import { searchCarTaxBaseRates } from '@/actions/car-tax-base-rate/search';
import { carTaxBaseRateFilterSchema } from '@/domain/car-tax-base-rate.filter';
import { errorResponseIfNotAdmin } from '@/api/authorization-utils';
import { badRequestResponseFromZod } from '@/api/utils';
import { withContext } from '@/api/with-context';

export const GET = withContext(async (request: NextRequest) => {
  const denied = await errorResponseIfNotAdmin();
  if (denied) return denied;

  const filter = carTaxBaseRateFilterSchema.safeParse(Object.fromEntries(request.nextUrl.searchParams));
  if (!filter.success) {
    return badRequestResponseFromZod(filter);
  }

  const result = await searchCarTaxBaseRates(filter.data);
  return Response.json(result);
});
