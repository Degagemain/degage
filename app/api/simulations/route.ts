import { type NextRequest } from 'next/server';
import { headers } from 'next/headers';
import { auth } from '@/auth';
import { searchSimulations } from '@/actions/simulation/search';
import { createSimulation } from '@/actions/simulation/create';
import { simulationFilterSchema } from '@/domain/simulation.filter';
import { simulationRunInputParseSchema } from '@/domain/simulation.model';
import { fromZodParseResult, safeParseRequestJson } from '@/api/utils';
import { statusCodes } from '@/api/status-codes';
import { withContext } from '@/api/with-context';
import { ZodError } from 'zod';

export const GET = withContext(async (request: NextRequest) => {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user) {
    return Response.json({ code: 'unauthorized', errors: [{ message: 'Authentication required' }] }, { status: statusCodes.UNAUTHORIZED });
  }

  const sp = request.nextUrl.searchParams;
  const params: Record<string, unknown> = {};
  for (const [key, value] of sp.entries()) {
    if (key === 'brandId' || key === 'resultCode') continue;
    params[key] = value;
  }
  params.brandIds = sp.getAll('brandId');
  params.resultCodes = sp.getAll('resultCode');

  const filterResult = simulationFilterSchema.safeParse(params);
  if (!filterResult.success) {
    return fromZodParseResult(filterResult);
  }

  const result = await searchSimulations(filterResult.data);
  return Response.json(result);
});

export const POST = withContext(async (request: NextRequest) => {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user) {
    return Response.json({ code: 'unauthorized', errors: [{ message: 'Authentication required' }] }, { status: statusCodes.UNAUTHORIZED });
  }

  const { data, errorResponse } = await safeParseRequestJson(request);
  if (errorResponse) return errorResponse;
  try {
    const input = simulationRunInputParseSchema.parse(data);
    const simulation = await createSimulation(input);
    return Response.json(simulation, { status: statusCodes.CREATED });
  } catch (error) {
    if (error instanceof ZodError) {
      return Response.json({ code: 'validation_error', errors: error.issues }, { status: statusCodes.BAD_REQUEST });
    }
    console.error(error);
    return Response.json(
      { code: 'internal_error', errors: [{ message: 'An unexpected error occurred' }] },
      { status: statusCodes.INTERNAL_SERVER_ERROR },
    );
  }
});
