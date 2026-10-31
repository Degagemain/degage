import * as z from 'zod';
import { DefaultTake, MaxTake, SortOrder } from './utils';

export enum FeatureFlagSortColumns {
  CODE = 'code',
  ENABLED = 'enabled',
  CREATED_AT = 'createdAt',
  UPDATED_AT = 'updatedAt',
}

export const featureFlagFilterSchema = z
  .object({
    query: z.string().nullable().default(null),
    skip: z.coerce.number().int().min(0).default(0),
    take: z.coerce.number().int().min(0).max(MaxTake).default(DefaultTake),
    sortBy: z.enum(Object.values(FeatureFlagSortColumns) as [string, ...string[]]).default(FeatureFlagSortColumns.CODE),
    sortOrder: z.enum(Object.values(SortOrder) as [string, ...string[]]).default(SortOrder.ASC),
  })
  .strict();

export type FeatureFlagFilter = z.infer<typeof featureFlagFilterSchema>;
