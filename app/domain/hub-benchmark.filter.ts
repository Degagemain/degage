import * as z from 'zod';
import { DefaultTake, MaxTake, SortOrder } from './utils';

export enum HubBenchmarkSortColumns {
  OWNER_KM = 'ownerKm',
  CREATED_AT = 'createdAt',
  UPDATED_AT = 'updatedAt',
}

export const hubBenchmarkFilterSchema = z
  .object({
    hubId: z.uuid().nullable().default(null),
    skip: z.coerce.number().int().min(0).default(0),
    take: z.coerce.number().int().min(0).max(MaxTake).default(DefaultTake),
    sortBy: z.enum(Object.values(HubBenchmarkSortColumns) as [string, ...string[]]).default(HubBenchmarkSortColumns.OWNER_KM),
    sortOrder: z.enum(Object.values(SortOrder) as [string, ...string[]]).default(SortOrder.ASC),
  })
  .strict();

export type HubBenchmarkFilter = z.infer<typeof hubBenchmarkFilterSchema>;
