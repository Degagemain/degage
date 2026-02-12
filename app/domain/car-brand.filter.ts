import * as z from 'zod';
import { DefaultTake, MaxTake, SortOrder } from './utils';

export enum CarBrandSortColumns {
  CODE = 'code',
  CREATED_AT = 'createdAt',
  UPDATED_AT = 'updatedAt',
}

export const carBrandFilterSchema = z
  .object({
    query: z.string().nullable().default(null),
    isActive: z
      .union([z.boolean(), z.string().transform((v) => v === 'true')])
      .nullable()
      .default(null),
    skip: z.coerce.number().int().min(0).default(0),
    take: z.coerce.number().int().min(0).max(MaxTake).default(DefaultTake),
    sortBy: z.enum(Object.values(CarBrandSortColumns) as [string, ...string[]]).default(CarBrandSortColumns.CODE),
    sortOrder: z.enum(Object.values(SortOrder) as [string, ...string[]]).default(SortOrder.ASC),
  })
  .strict();

export type CarBrandFilter = z.infer<typeof carBrandFilterSchema>;
