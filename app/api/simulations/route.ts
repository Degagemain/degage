import { type NextRequest } from 'next/server';
import { headers } from 'next/headers';
import { auth } from '@/auth';
import { searchSimulations } from '@/actions/simulation/search';
import { createSimulation } from '@/actions/simulation/create';
import { parseSimulationFilterFromSearchParams } from '@/api/simulations/simulation-query-params';
import { simulationRunInputParseSchema } from '@/domain/simulation.model';
import { safeParseRequestJson } from '@/api/utils';
import { statusCodes } from '@/api/status-codes';
import { withContext } from '@/api/with-context';
import { ZodError } from 'zod';

export const GET = withContext(async (request: NextRequest) => {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user) {
    return Response.json({ code: 'unauthorized', errors: [{ message: 'Authentication required' }] }, { status: statusCodes.UNAUTHORIZED });
  }

  const { data: filter, errorResponse } = parseSimulationFilterFromSearchParams(request.nextUrl.searchParams);
  if (errorResponse) return errorResponse;

  const result = await searchSimulations(filter);
  return Response.json(result);
});

/** Public endpoint: run simulation (e.g. from public wizard). No auth required. */
export const POST = withContext(async (request: NextRequest) => {
  const { data, errorResponse } = await safeParseRequestJson(request);
  if (errorResponse) return errorResponse;

  const skipPersistence = request.nextUrl?.searchParams?.get('skipPersistence') === 'true';

  try {
    const input = simulationRunInputParseSchema.parse(data);
    const simulation = await createSimulation(input, { skipPersistence });
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
