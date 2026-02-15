import * as z from 'zod';
import { DefaultTake, MaxTake, SortOrder } from './utils';
import { SystemParameterCategory } from './system-parameter.model';

export enum SystemParameterSortColumns {
  CODE = 'code',
  CATEGORY = 'category',
  CREATED_AT = 'createdAt',
  UPDATED_AT = 'updatedAt',
}

export const systemParameterFilterSchema = z
  .object({
    query: z.string().nullable().default(null),
    category: z.nativeEnum(SystemParameterCategory).nullable().default(null),
    skip: z.coerce.number().int().min(0).default(0),
    take: z.coerce.number().int().min(0).max(MaxTake).default(DefaultTake),
    sortBy: z.enum(Object.values(SystemParameterSortColumns) as [string, ...string[]]).default(SystemParameterSortColumns.CODE),
    sortOrder: z.enum(Object.values(SortOrder) as [string, ...string[]]).default(SortOrder.ASC),
  })
  .strict();

export type SystemParameterFilter = z.infer<typeof systemParameterFilterSchema>;
