import * as z from 'zod';
import { DefaultTake, MaxTake, SortOrder } from './utils';
import { SimulationResultCode } from './simulation.model';

export enum SimulationSortColumns {
  CREATED_AT = 'createdAt',
  UPDATED_AT = 'updatedAt',
  RESULT_CODE = 'resultCode',
  FIRST_REGISTERED_AT = 'firstRegisteredAt',
}

export const simulationFilterSchema = z
  .object({
    query: z.string().nullable().default(null),
    brandIds: z.array(z.uuid()).default([]),
    fuelTypeIds: z.array(z.uuid()).default([]),
    carTypeIds: z.array(z.uuid()).default([]),
    resultCodes: z.array(z.enum(SimulationResultCode)).default([]),
    skip: z.coerce.number().int().min(0).default(0),
    take: z.coerce.number().int().min(0).max(MaxTake).default(DefaultTake),
    sortBy: z.enum(Object.values(SimulationSortColumns) as [string, ...string[]]).default(SimulationSortColumns.CREATED_AT),
    sortOrder: z.enum(Object.values(SortOrder) as [string, ...string[]]).default(SortOrder.DESC),
  })
  .strict();

export type SimulationFilter = z.infer<typeof simulationFilterSchema>;
