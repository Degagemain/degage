import * as z from 'zod';
import { FuelTypeSortColumns } from '@/domain/fuel-type.filter';
import { DefaultTake, MaxTake, SortOrder } from '@/domain/utils';

export const fuelTypeSearchMcpInputSchema = {
  query: z.string().nullable().optional().describe('Free-text search in fuel type names.'),
  isActive: z.boolean().nullable().optional().describe('Filter by active status. Omit for no filter.'),
  skip: z.number().int().min(0).optional().describe('Pagination offset (default 0).'),
  take: z.number().int().min(0).max(MaxTake).optional().describe(`Page size (default ${DefaultTake}, max ${MaxTake}).`),
  sortBy: z
    .nativeEnum(FuelTypeSortColumns)
    .optional()
    .describe(`Sort column. Values: ${Object.values(FuelTypeSortColumns).join(', ')}.`),
  sortOrder: z.nativeEnum(SortOrder).optional().describe('Sort direction: asc or desc.'),
};
