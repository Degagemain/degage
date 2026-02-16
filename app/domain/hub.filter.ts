import * as z from 'zod';
import { DefaultTake, MaxTake, SortOrder } from './utils';

export enum HubSortColumns {
  NAME = 'name',
  IS_DEFAULT = 'isDefault',
  CREATED_AT = 'createdAt',
  UPDATED_AT = 'updatedAt',
}

export const hubFilterSchema = z
  .object({
    query: z.string().nullable().default(null),
    isDefault: z
      .union([z.boolean(), z.string().transform((v) => v === 'true')])
      .nullable()
      .default(null),
    skip: z.coerce.number().int().min(0).default(0),
    take: z.coerce.number().int().min(0).max(MaxTake).default(DefaultTake),
    sortBy: z.enum(Object.values(HubSortColumns) as [string, ...string[]]).default(HubSortColumns.NAME),
    sortOrder: z.enum(Object.values(SortOrder) as [string, ...string[]]).default(SortOrder.ASC),
  })
  .strict();

export type HubFilter = z.infer<typeof hubFilterSchema>;
