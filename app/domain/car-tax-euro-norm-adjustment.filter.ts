import * as z from 'zod';
import { DefaultTake, MaxTake, SortOrder } from './utils';

export enum CarTaxEuroNormAdjustmentSortColumns {
  EURO_NORM_GROUP = 'euroNormGroup',
  CREATED_AT = 'createdAt',
  UPDATED_AT = 'updatedAt',
}

export const carTaxEuroNormAdjustmentFilterSchema = z
  .object({
    query: z.string().nullable().default(null),
    euroNormGroup: z.coerce.number().int().min(0).nullable().default(null),
    skip: z.coerce.number().int().min(0).default(0),
    take: z.coerce.number().int().min(0).max(MaxTake).default(DefaultTake),
    sortBy: z
      .enum(Object.values(CarTaxEuroNormAdjustmentSortColumns) as [string, ...string[]])
      .default(CarTaxEuroNormAdjustmentSortColumns.EURO_NORM_GROUP),
    sortOrder: z.enum(Object.values(SortOrder) as [string, ...string[]]).default(SortOrder.ASC),
  })
  .strict();

export type CarTaxEuroNormAdjustmentFilter = z.infer<typeof carTaxEuroNormAdjustmentFilterSchema>;
