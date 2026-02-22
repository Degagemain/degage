import * as z from 'zod';
import { DefaultTake, MaxTake, SortOrder } from './utils';

export enum CarInfoSortColumns {
  YEAR = 'year',
  CYLINDER_CC = 'cylinderCc',
  CO2_EMISSION = 'co2Emission',
  CREATED_AT = 'createdAt',
  UPDATED_AT = 'updatedAt',
}

export const carInfoFilterSchema = z
  .object({
    carTypeId: z.uuid().nullable().default(null),
    skip: z.coerce.number().int().min(0).default(0),
    take: z.coerce.number().int().min(0).max(MaxTake).default(DefaultTake),
    sortBy: z.enum(Object.values(CarInfoSortColumns) as [string, ...string[]]).default(CarInfoSortColumns.UPDATED_AT),
    sortOrder: z.enum(Object.values(SortOrder) as [string, ...string[]]).default(SortOrder.DESC),
  })
  .strict();

export type CarInfoFilter = z.infer<typeof carInfoFilterSchema>;
