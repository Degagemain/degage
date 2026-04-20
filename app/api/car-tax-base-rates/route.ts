import { type NextRequest } from 'next/server';
import { searchCarTaxBaseRates } from '@/actions/car-tax-base-rate/search';
import { carTaxBaseRateFilterSchema } from '@/domain/car-tax-base-rate.filter';
import { badRequestResponseFromZod } from '@/api/utils';
import { withAdmin } from '@/api/with-context';

export const GET = withAdmin(async (request: NextRequest) => {
  const filter = carTaxBaseRateFilterSchema.safeParse(Object.fromEntries(request.nextUrl.searchParams));
  if (!filter.success) {
    return badRequestResponseFromZod(filter);
  }

  const result = await searchCarTaxBaseRates(filter.data);
  return Response.json(result);
});
