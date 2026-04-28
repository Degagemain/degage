import * as z from 'zod';
import { DefaultTake, MaxTake, SortOrder } from './utils';

export enum DocumentationGroupSortColumns {
  SORT_ORDER = 'sortOrder',
  CREATED_AT = 'createdAt',
  UPDATED_AT = 'updatedAt',
}

export const documentationGroupFilterSchema = z
  .object({
    query: z.string().nullable().default(null),
    skip: z.coerce.number().int().min(0).default(0),
    take: z.coerce.number().int().min(0).max(MaxTake).default(DefaultTake),
    sortBy: z.nativeEnum(DocumentationGroupSortColumns).default(DocumentationGroupSortColumns.SORT_ORDER),
    sortOrder: z.nativeEnum(SortOrder).default(SortOrder.ASC),
  })
  .strict();

export type DocumentationGroupFilter = z.infer<typeof documentationGroupFilterSchema>;
