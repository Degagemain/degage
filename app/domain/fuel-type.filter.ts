import * as z from 'zod';
import { DefaultTake, MaxTake, SortOrder } from './utils';

export enum FuelTypeSortColumns {
  CODE = 'code',
  PRICE_PER = 'pricePer',
  CO2_CONTRIBUTION = 'co2Contribution',
  CREATED_AT = 'createdAt',
  UPDATED_AT = 'updatedAt',
}

export const fuelTypeFilterSchema = z
  .object({
    query: z.string().nullable().default(null),
    isActive: z
      .union([z.boolean(), z.string().transform((v) => v === 'true')])
      .nullable()
      .default(null),
    skip: z.coerce.number().int().min(0).default(0),
    take: z.coerce.number().int().min(0).max(MaxTake).default(DefaultTake),
    sortBy: z.enum(Object.values(FuelTypeSortColumns) as [string, ...string[]]).default(FuelTypeSortColumns.CODE),
    sortOrder: z.enum(Object.values(SortOrder) as [string, ...string[]]).default(SortOrder.ASC),
  })
  .strict();

export type FuelTypeFilter = z.infer<typeof fuelTypeFilterSchema>;
