import * as z from 'zod';
import { CarTypeSortColumns } from '@/domain/car-type.filter';
import { DefaultTake, MaxTake, SortOrder } from '@/domain/utils';

export const carTypeSearchMcpInputSchema = {
  brandId: z.uuid().describe('Car brand UUID. Use search_car_brands to find ids.'),
  fuelTypeId: z.uuid().describe('Fuel type UUID. Use search_fuel_types to find ids.'),
  query: z.string().nullable().optional().describe('Free-text search in car type names.'),
  isActive: z.boolean().nullable().optional().describe('Filter by active status. Omit for no filter.'),
  skip: z.number().int().min(0).optional().describe('Pagination offset (default 0).'),
  take: z.number().int().min(0).max(MaxTake).optional().describe(`Page size (default ${DefaultTake}, max ${MaxTake}).`),
  sortBy: z
    .nativeEnum(CarTypeSortColumns)
    .optional()
    .describe(`Sort column. Values: ${Object.values(CarTypeSortColumns).join(', ')}.`),
  sortOrder: z.nativeEnum(SortOrder).optional().describe('Sort direction: asc or desc.'),
};

export const carTypeMcpFilterSchema = z
  .object({
    brandId: z.uuid(),
    fuelTypeId: z.uuid(),
    query: z.string().nullable().optional(),
    isActive: z.boolean().nullable().optional(),
    skip: z.number().int().min(0).optional(),
    take: z.number().int().min(0).max(MaxTake).optional(),
    sortBy: z.nativeEnum(CarTypeSortColumns).optional(),
    sortOrder: z.nativeEnum(SortOrder).optional(),
  })
  .transform((input) => ({
    query: input.query ?? null,
    brandIds: [input.brandId],
    fuelTypeIds: [input.fuelTypeId],
    isActive: input.isActive ?? null,
    skip: input.skip ?? 0,
    take: input.take ?? DefaultTake,
    sortBy: input.sortBy ?? CarTypeSortColumns.NAME,
    sortOrder: input.sortOrder ?? SortOrder.ASC,
  }));
