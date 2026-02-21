import * as z from 'zod';
import { DefaultTake, MaxTake, SortOrder } from './utils';

export enum CarTaxFlatRateSortColumns {
  START = 'start',
  RATE = 'rate',
  CREATED_AT = 'createdAt',
  UPDATED_AT = 'updatedAt',
}

export const carTaxFlatRateFilterSchema = z
  .object({
    query: z.string().nullable().default(null),
    skip: z.coerce.number().int().min(0).default(0),
    take: z.coerce.number().int().min(0).max(MaxTake).default(DefaultTake),
    sortBy: z.enum(Object.values(CarTaxFlatRateSortColumns) as [string, ...string[]]).default(CarTaxFlatRateSortColumns.START),
    sortOrder: z.enum(Object.values(SortOrder) as [string, ...string[]]).default(SortOrder.DESC),
  })
  .strict();

export type CarTaxFlatRateFilter = z.infer<typeof carTaxFlatRateFilterSchema>;
