import { type NextRequest } from 'next/server';
import { ZodError } from 'zod';
import { searchSimulations } from '@/actions/simulation/search';
import { createSimulation } from '@/actions/simulation/create';
import { simulationFilterSchema } from '@/domain/simulation.filter';
import { simulationRunInputParseSchema } from '@/domain/simulation.model';
import { badRequestResponseFromZod, safeParseRequestJson } from '@/api/utils';
import { statusCodes } from '@/api/status-codes';
import { withAuth, withPublic } from '@/api/with-context';

const simulationFilterInputFromSearchParams = (sp: URLSearchParams): Record<string, unknown> => {
  return {
    query: sp.get('query') ?? undefined,
    brandIds: sp.getAll('brandId'),
    fuelTypeIds: sp.getAll('fuelTypeId'),
    carTypeIds: sp.getAll('carTypeId'),
    resultCodes: sp.getAll('resultCode'),
    skip: sp.get('skip') ?? undefined,
    take: sp.get('take') ?? undefined,
    sortBy: sp.get('sortBy') ?? undefined,
    sortOrder: sp.get('sortOrder') ?? undefined,
  };
};

export const GET = withAuth(async (request: NextRequest) => {
  const filter = simulationFilterSchema.safeParse(simulationFilterInputFromSearchParams(request.nextUrl.searchParams));
  if (!filter.success) {
    return badRequestResponseFromZod(filter);
  }

  const result = await searchSimulations(filter.data);
  return Response.json(result);
});

/** Public endpoint: run simulation (e.g. from public wizard). No auth required. */
export const POST = withPublic(async (request: NextRequest) => {
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
