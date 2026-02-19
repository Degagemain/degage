import * as z from 'zod';
import { DefaultTake, MaxTake, SortOrder } from './utils';

export enum CarPriceEstimateSortColumns {
  YEAR = 'year',
  PRICE = 'price',
  CREATED_AT = 'createdAt',
  UPDATED_AT = 'updatedAt',
}

export const carPriceEstimateFilterSchema = z
  .object({
    carTypeId: z.uuid().nullable().default(null),
    skip: z.coerce.number().int().min(0).default(0),
    take: z.coerce.number().int().min(0).max(MaxTake).default(DefaultTake),
    sortBy: z.enum(Object.values(CarPriceEstimateSortColumns) as [string, ...string[]]).default(CarPriceEstimateSortColumns.UPDATED_AT),
    sortOrder: z.enum(Object.values(SortOrder) as [string, ...string[]]).default(SortOrder.DESC),
  })
  .strict();

export type CarPriceEstimateFilter = z.infer<typeof carPriceEstimateFilterSchema>;
