import { type NextRequest } from 'next/server';
import { headers } from 'next/headers';
import { auth } from '@/auth';
import { isAdmin } from '@/domain/role.utils';
import { searchEuroNorms } from '@/actions/euro-norm/search';
import { createEuroNorm } from '@/actions/euro-norm/create';
import { euroNormFilterSchema } from '@/domain/euro-norm.filter';
import { forbiddenResponse, fromZodParseResult, tryCreateResource, unauthorizedResponse } from '@/api/utils';
import { statusCodes } from '@/api/status-codes';
import { withContext } from '@/api/with-context';

export const GET = withContext(async (request: NextRequest) => {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user) {
    return unauthorizedResponse();
  }

  const euroNormFilter = euroNormFilterSchema.safeParse(Object.fromEntries(request.nextUrl.searchParams));
  if (!euroNormFilter.success) {
    return fromZodParseResult(euroNormFilter);
  }

  const result = await searchEuroNorms(euroNormFilter.data);
  return Response.json(result);
});

export const POST = withContext(async (request: NextRequest) => {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user) {
    return unauthorizedResponse();
  }

  if (!isAdmin(session.user)) {
    return forbiddenResponse('Admin access required');
  }

  try {
    const euroNorm = await request.json();
    return tryCreateResource(createEuroNorm, euroNorm);
  } catch (error) {
    console.error(error);
    return Response.json(
      { code: 'internal_error', errors: [{ message: 'Failed to parse request body' }] },
      { status: statusCodes.INTERNAL_SERVER_ERROR },
    );
  }
});
