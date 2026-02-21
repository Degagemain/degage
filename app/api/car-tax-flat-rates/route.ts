import { type NextRequest } from 'next/server';
import { headers } from 'next/headers';
import { auth } from '@/auth';
import { isAdmin } from '@/domain/role.utils';
import { searchCarTaxFlatRates } from '@/actions/car-tax-flat-rate/search';
import { carTaxFlatRateFilterSchema } from '@/domain/car-tax-flat-rate.filter';
import { forbiddenResponse, fromZodParseResult, unauthorizedResponse } from '@/api/utils';
import { withContext } from '@/api/with-context';

export const GET = withContext(async (request: NextRequest) => {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user) {
    return unauthorizedResponse();
  }

  if (!isAdmin(session.user)) {
    return forbiddenResponse('Admin access required');
  }

  const filter = carTaxFlatRateFilterSchema.safeParse(Object.fromEntries(request.nextUrl.searchParams));
  if (!filter.success) {
    return fromZodParseResult(filter);
  }

  const result = await searchCarTaxFlatRates(filter.data);
  return Response.json(result);
});
