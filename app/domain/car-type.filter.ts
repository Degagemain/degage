import * as z from 'zod';
import { DefaultTake, MaxTake, SortOrder } from './utils';

export enum CarTypeSortColumns {
  NAME = 'name',
  ECOSCORE = 'ecoscore',
  CREATED_AT = 'createdAt',
  UPDATED_AT = 'updatedAt',
}

export const carTypeFilterSchema = z
  .object({
    query: z.string().nullable().default(null),
    brandIds: z.array(z.string().uuid()).default([]),
    fuelTypeIds: z.array(z.string().uuid()).default([]),
    isActive: z
      .union([z.boolean(), z.string().transform((v) => v === 'true')])
      .nullable()
      .default(null),
    skip: z.coerce.number().int().min(0).default(0),
    take: z.coerce.number().int().min(0).max(MaxTake).default(DefaultTake),
    sortBy: z.enum(Object.values(CarTypeSortColumns) as [string, ...string[]]).default(CarTypeSortColumns.NAME),
    sortOrder: z.enum(Object.values(SortOrder) as [string, ...string[]]).default(SortOrder.ASC),
  })
  .strict();

export type CarTypeFilter = z.infer<typeof carTypeFilterSchema>;
