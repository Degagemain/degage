import * as z from 'zod';
import { DefaultTake, MaxTake, SortOrder } from './utils';

export enum ProvinceSortColumns {
  NAME = 'name',
  CREATED_AT = 'createdAt',
  UPDATED_AT = 'updatedAt',
}

export const provinceFilterSchema = z
  .object({
    query: z.string().nullable().default(null),
    skip: z.coerce.number().int().min(0).default(0),
    take: z.coerce.number().int().min(0).max(MaxTake).default(DefaultTake),
    sortBy: z.enum(Object.values(ProvinceSortColumns) as [string, ...string[]]).default(ProvinceSortColumns.NAME),
    sortOrder: z.enum(Object.values(SortOrder) as [string, ...string[]]).default(SortOrder.ASC),
  })
  .strict();

export type ProvinceFilter = z.infer<typeof provinceFilterSchema>;
