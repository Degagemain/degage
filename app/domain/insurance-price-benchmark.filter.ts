import * as z from 'zod';
import { DefaultTake, MaxTake, SortOrder } from './utils';

export enum InsurancePriceBenchmarkSortColumns {
  YEAR = 'year',
  MAX_CAR_PRICE = 'maxCarPrice',
  CREATED_AT = 'createdAt',
  UPDATED_AT = 'updatedAt',
}

export const insurancePriceBenchmarkFilterSchema = z
  .object({
    year: z.coerce.number().int().min(2000).max(2100).nullable().default(null),
    skip: z.coerce.number().int().min(0).default(0),
    take: z.coerce.number().int().min(0).max(MaxTake).default(DefaultTake),
    sortBy: z.enum(Object.values(InsurancePriceBenchmarkSortColumns) as [string, ...string[]]).default(InsurancePriceBenchmarkSortColumns.YEAR),
    sortOrder: z.enum(Object.values(SortOrder) as [string, ...string[]]).default(SortOrder.ASC),
  })
  .strict();

export type InsurancePriceBenchmarkFilter = z.infer<typeof insurancePriceBenchmarkFilterSchema>;
