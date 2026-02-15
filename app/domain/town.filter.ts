import * as z from 'zod';
import { DefaultTake, MaxTake, SortOrder } from './utils';

export enum TownSortColumns {
  ZIP = 'zip',
  NAME = 'name',
  MUNICIPALITY = 'municipality',
  HIGH_DEMAND = 'highDemand',
  CREATED_AT = 'createdAt',
  UPDATED_AT = 'updatedAt',
}

export const townFilterSchema = z
  .object({
    query: z.string().nullable().default(null),
    provinceId: z.string().uuid().nullable().default(null),
    simulationRegionId: z.string().uuid().nullable().default(null),
    highDemand: z
      .union([z.boolean(), z.string().transform((v) => v === 'true')])
      .nullable()
      .default(null),
    hasActiveMembers: z
      .union([z.boolean(), z.string().transform((v) => v === 'true')])
      .nullable()
      .default(null),
    skip: z.coerce.number().int().min(0).default(0),
    take: z.coerce.number().int().min(0).max(MaxTake).default(DefaultTake),
    sortBy: z.enum(Object.values(TownSortColumns) as [string, ...string[]]).default(TownSortColumns.NAME),
    sortOrder: z.enum(Object.values(SortOrder) as [string, ...string[]]).default(SortOrder.ASC),
  })
  .strict();

export type TownFilter = z.infer<typeof townFilterSchema>;
