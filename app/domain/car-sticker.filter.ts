import * as z from 'zod';
import { DefaultTake, MaxTake, SortOrder } from './utils';

export enum CarStickerSortColumns {
  NAME = 'name',
  IS_ACTIVE = 'isActive',
  IS_ALWAYS_INCLUDED = 'isAlwaysIncluded',
  CREATED_AT = 'createdAt',
  UPDATED_AT = 'updatedAt',
}

export const carStickerFilterSchema = z
  .object({
    query: z.string().nullable().default(null),
    skip: z.coerce.number().int().min(0).default(0),
    take: z.coerce.number().int().min(0).max(MaxTake).default(DefaultTake),
    sortBy: z.enum(Object.values(CarStickerSortColumns) as [string, ...string[]]).default(CarStickerSortColumns.NAME),
    sortOrder: z.enum(Object.values(SortOrder) as [string, ...string[]]).default(SortOrder.ASC),
  })
  .strict();

export type CarStickerFilter = z.infer<typeof carStickerFilterSchema>;
