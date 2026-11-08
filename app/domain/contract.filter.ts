import * as z from 'zod';
import { DefaultTake, MaxTake, SortOrder } from './utils';
import { contractStatusValues } from './contract.model';

export enum ContractSortColumns {
  START_DATE = 'startDate',
  END_DATE = 'endDate',
  STATUS = 'status',
  CREATED_AT = 'createdAt',
  UPDATED_AT = 'updatedAt',
}

export const contractFilterSchema = z
  .object({
    query: z.string().nullable().default(null),
    status: z.enum(contractStatusValues).nullable().default(null),
    typeId: z.uuid().nullable().default(null),
    userId: z.string().min(1).nullable().default(null),
    skip: z.coerce.number().int().min(0).default(0),
    take: z.coerce.number().int().min(0).max(MaxTake).default(DefaultTake),
    sortBy: z.enum(Object.values(ContractSortColumns) as [string, ...string[]]).default(ContractSortColumns.UPDATED_AT),
    sortOrder: z.enum(Object.values(SortOrder) as [string, ...string[]]).default(SortOrder.DESC),
  })
  .strict();

export type ContractFilter = z.infer<typeof contractFilterSchema>;
