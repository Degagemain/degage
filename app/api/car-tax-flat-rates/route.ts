import { type NextRequest } from 'next/server';
import { searchCarTaxFlatRates } from '@/actions/car-tax-flat-rate/search';
import { carTaxFlatRateFilterSchema } from '@/domain/car-tax-flat-rate.filter';
import { errorResponseIfNotAdmin } from '@/api/authorization-utils';
import { badRequestResponseFromZod } from '@/api/utils';
import { withContext } from '@/api/with-context';

export const GET = withContext(async (request: NextRequest) => {
  const denied = await errorResponseIfNotAdmin();
  if (denied) return denied;

  const filter = carTaxFlatRateFilterSchema.safeParse(Object.fromEntries(request.nextUrl.searchParams));
  if (!filter.success) {
    return badRequestResponseFromZod(filter);
  }

  const result = await searchCarTaxFlatRates(filter.data);
  return Response.json(result);
});
