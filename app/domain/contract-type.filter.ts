import * as z from 'zod';
import { DefaultTake, MaxTake, SortOrder } from './utils';

export enum ContractTypeSortColumns {
  CODE = 'code',
  NAME = 'name',
  CREATED_AT = 'createdAt',
  UPDATED_AT = 'updatedAt',
}

export const contractTypeFilterSchema = z
  .object({
    query: z.string().nullable().default(null),
    skip: z.coerce.number().int().min(0).default(0),
    take: z.coerce.number().int().min(0).max(MaxTake).default(DefaultTake),
    sortBy: z.enum(Object.values(ContractTypeSortColumns) as [string, ...string[]]).default(ContractTypeSortColumns.CODE),
    sortOrder: z.enum(Object.values(SortOrder) as [string, ...string[]]).default(SortOrder.ASC),
  })
  .strict();

export type ContractTypeFilter = z.infer<typeof contractTypeFilterSchema>;
