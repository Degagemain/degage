import * as z from 'zod';
import { DefaultTake, MaxTake, SortOrder } from './utils';

export enum SimulationRegionSortColumns {
  NAME = 'name',
  IS_DEFAULT = 'isDefault',
  CREATED_AT = 'createdAt',
  UPDATED_AT = 'updatedAt',
}

export const simulationRegionFilterSchema = z
  .object({
    query: z.string().nullable().default(null),
    isDefault: z
      .union([z.boolean(), z.string().transform((v) => v === 'true')])
      .nullable()
      .default(null),
    skip: z.coerce.number().int().min(0).default(0),
    take: z.coerce.number().int().min(0).max(MaxTake).default(DefaultTake),
    sortBy: z.enum(Object.values(SimulationRegionSortColumns) as [string, ...string[]]).default(SimulationRegionSortColumns.NAME),
    sortOrder: z.enum(Object.values(SortOrder) as [string, ...string[]]).default(SortOrder.ASC),
  })
  .strict();

export type SimulationRegionFilter = z.infer<typeof simulationRegionFilterSchema>;
