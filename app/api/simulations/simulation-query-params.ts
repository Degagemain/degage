import * as z from 'zod';
import {
  type SimulationExportRequest,
  type SimulationFilter,
  simulationExportRequestSchema,
  simulationFilterSchema,
} from '@/domain/simulation.filter';
import { badRequestResponseFromZod } from '@/api/utils';

const parseSimulationQueryFromSearchParams = <T>(
  sp: URLSearchParams,
  schema: z.ZodType<T>,
  extra: Record<string, unknown>,
): { data: T; errorResponse: null } | { data: null; errorResponse: Response } => {
  const parsed = schema.safeParse({
    query: sp.get('query') ?? undefined,
    brandIds: sp.getAll('brandId'),
    fuelTypeIds: sp.getAll('fuelTypeId'),
    carTypeIds: sp.getAll('carTypeId'),
    resultCodes: sp.getAll('resultCode'),
    sortBy: sp.get('sortBy') ?? undefined,
    sortOrder: sp.get('sortOrder') ?? undefined,
    ...extra,
  });

  if (!parsed.success) {
    return { data: null, errorResponse: badRequestResponseFromZod(parsed) };
  }
  return { data: parsed.data, errorResponse: null };
};

export const parseSimulationFilterFromSearchParams = (
  sp: URLSearchParams,
): { data: SimulationFilter; errorResponse: null } | { data: null; errorResponse: Response } => {
  return parseSimulationQueryFromSearchParams(sp, simulationFilterSchema, {
    skip: sp.get('skip') ?? undefined,
    take: sp.get('take') ?? undefined,
  });
};

export const parseSimulationExportRequestFromSearchParams = (
  sp: URLSearchParams,
): { data: SimulationExportRequest; errorResponse: null } | { data: null; errorResponse: Response } => {
  return parseSimulationQueryFromSearchParams(sp, simulationExportRequestSchema, {
    format: sp.get('format') ?? undefined,
  });
};
