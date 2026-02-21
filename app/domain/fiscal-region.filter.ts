import * as z from 'zod';
import { DefaultTake, MaxTake, SortOrder } from './utils';

export enum FiscalRegionSortColumns {
  CODE = 'code',
  CREATED_AT = 'createdAt',
  UPDATED_AT = 'updatedAt',
}

export const fiscalRegionFilterSchema = z
  .object({
    query: z.string().nullable().default(null),
    isDefault: z
      .union([z.boolean(), z.string().transform((v) => v === 'true')])
      .nullable()
      .default(null),
    skip: z.coerce.number().int().min(0).default(0),
    take: z.coerce.number().int().min(0).max(MaxTake).default(DefaultTake),
    sortBy: z.enum(Object.values(FiscalRegionSortColumns) as [string, ...string[]]).default(FiscalRegionSortColumns.CODE),
    sortOrder: z.enum(Object.values(SortOrder) as [string, ...string[]]).default(SortOrder.ASC),
  })
  .strict();

export type FiscalRegionFilter = z.infer<typeof fiscalRegionFilterSchema>;
