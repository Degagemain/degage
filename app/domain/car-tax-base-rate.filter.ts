import * as z from 'zod';
import { DefaultTake, MaxTake, SortOrder } from './utils';

export enum CarTaxBaseRateSortColumns {
  MAX_CC = 'maxCc',
  FISCAL_PK = 'fiscalPk',
  START = 'start',
  RATE = 'rate',
  CREATED_AT = 'createdAt',
  UPDATED_AT = 'updatedAt',
}

export const carTaxBaseRateFilterSchema = z
  .object({
    query: z.string().nullable().default(null),
    skip: z.coerce.number().int().min(0).default(0),
    take: z.coerce.number().int().min(0).max(MaxTake).default(DefaultTake),
    sortBy: z.enum(Object.values(CarTaxBaseRateSortColumns) as [string, ...string[]]).default(CarTaxBaseRateSortColumns.MAX_CC),
    sortOrder: z.enum(Object.values(SortOrder) as [string, ...string[]]).default(SortOrder.ASC),
  })
  .strict();

export type CarTaxBaseRateFilter = z.infer<typeof carTaxBaseRateFilterSchema>;
