import * as z from 'zod';
import { DefaultTake, MaxTake, SortOrder } from './utils';

export enum InsurerSortColumns {
  NAME = 'name',
  CREATED_AT = 'createdAt',
  UPDATED_AT = 'updatedAt',
}

export const insurerFilterSchema = z
  .object({
    query: z.string().nullable().default(null),
    skip: z.coerce.number().int().min(0).default(0),
    take: z.coerce.number().int().min(0).max(MaxTake).default(DefaultTake),
    sortBy: z.enum(Object.values(InsurerSortColumns) as [string, ...string[]]).default(InsurerSortColumns.NAME),
    sortOrder: z.enum(Object.values(SortOrder) as [string, ...string[]]).default(SortOrder.ASC),
  })
  .strict();

export type InsurerFilter = z.infer<typeof insurerFilterSchema>;
