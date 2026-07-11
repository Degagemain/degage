import * as z from 'zod';
import { DefaultTake, MaxTake, SortOrder } from './utils';

export enum RoadAssistancePlanSortColumns {
  CREATED_AT = 'createdAt',
  UPDATED_AT = 'updatedAt',
}

export const roadAssistancePlanFilterSchema = z
  .object({
    query: z.string().nullable().default(null),
    isActive: z
      .union([z.boolean(), z.string().transform((v) => v === 'true')])
      .nullable()
      .default(null),
    skip: z.coerce.number().int().min(0).default(0),
    take: z.coerce.number().int().min(0).max(MaxTake).default(DefaultTake),
    sortBy: z.enum(Object.values(RoadAssistancePlanSortColumns) as [string, ...string[]]).default(RoadAssistancePlanSortColumns.UPDATED_AT),
    sortOrder: z.enum(Object.values(SortOrder) as [string, ...string[]]).default(SortOrder.DESC),
  })
  .strict();

export type RoadAssistancePlanFilter = z.infer<typeof roadAssistancePlanFilterSchema>;
