import type { NextRequest } from 'next/server';
import { ZodError } from 'zod';
import { createCarOnboarding } from '@/actions/car-onboarding/create';
import { searchCarOnboardings } from '@/actions/car-onboarding/search';
import { CarOnboardingForbiddenError } from '@/actions/car-onboarding/car-onboarding-forbidden.error';
import { carOnboardingCreateInputSchema } from '@/domain/car-onboarding.model';
import { carOnboardingFilterSchema } from '@/domain/car-onboarding.filter';
import { badRequestResponseFromZod, forbiddenResponse, isPrismaNotFoundError, notFoundResponse, safeParseRequestJson } from '@/api/utils';
import { statusCodes } from '@/api/status-codes';
import { withAdmin, withAuth } from '@/api/with-context';
import { logger } from '@/lib/logger';

const carOnboardingFilterInputFromSearchParams = (sp: URLSearchParams): Record<string, unknown> => ({
  query: sp.get('query') ?? undefined,
  statusInPreparation: sp.getAll('statusInPreparation'),
  carValueStatuses: sp.getAll('carValueStatus'),
  skip: sp.get('skip') ?? undefined,
  take: sp.get('take') ?? undefined,
  sortBy: sp.get('sortBy') ?? undefined,
  sortOrder: sp.get('sortOrder') ?? undefined,
});

export const GET = withAdmin(async (request: NextRequest) => {
  const filter = carOnboardingFilterSchema.safeParse(carOnboardingFilterInputFromSearchParams(request.nextUrl.searchParams));
  if (!filter.success) {
    return badRequestResponseFromZod(filter);
  }

  const result = await searchCarOnboardings(filter.data);
  return Response.json(result);
});

export const POST = withAuth(async (request: NextRequest, _context, session) => {
  const { data, errorResponse } = await safeParseRequestJson(request);
  if (errorResponse) return errorResponse;

  const input = carOnboardingCreateInputSchema.safeParse(data);
  if (!input.success) {
    return badRequestResponseFromZod(input);
  }

  try {
    const created = await createCarOnboarding(input.data, session.user);
    return Response.json(created, { status: statusCodes.CREATED });
  } catch (error) {
    if (error instanceof ZodError) {
      return Response.json({ code: 'validation_error', errors: error.issues }, { status: statusCodes.BAD_REQUEST });
    }
    if (error instanceof CarOnboardingForbiddenError) {
      return forbiddenResponse(error.message);
    }
    if (isPrismaNotFoundError(error)) {
      return notFoundResponse();
    }
    logger.exception(error, { route: 'POST /api/car-onboardings' });
    return Response.json(
      { code: 'internal_error', errors: [{ message: 'An unexpected error occurred' }] },
      { status: statusCodes.INTERNAL_SERVER_ERROR },
    );
  }
});
