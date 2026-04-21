import { type NextRequest } from 'next/server';
import { searchCarTaxFlatRates } from '@/actions/car-tax-flat-rate/search';
import { carTaxFlatRateFilterSchema } from '@/domain/car-tax-flat-rate.filter';
import { badRequestResponseFromZod } from '@/api/utils';
import { withAdmin } from '@/api/with-context';

export const GET = withAdmin(async (request: NextRequest) => {
  const filter = carTaxFlatRateFilterSchema.safeParse(Object.fromEntries(request.nextUrl.searchParams));
  if (!filter.success) {
    return badRequestResponseFromZod(filter);
  }

  const result = await searchCarTaxFlatRates(filter.data);
  return Response.json(result);
});
