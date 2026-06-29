import * as z from 'zod';
import { DocumentType } from '@/domain/document.model';
import { DefaultTake, MaxTake, SortOrder } from './utils';

export enum DocumentSortColumns {
  FILE_NAME = 'fileName',
  TYPE = 'type',
  CREATED_AT = 'createdAt',
  UPDATED_AT = 'updatedAt',
}

export const documentFilterSchema = z
  .object({
    query: z.string().nullable().default(null),
    type: z.enum(DocumentType).nullable().default(null),
    skip: z.coerce.number().int().min(0).default(0),
    take: z.coerce.number().int().min(0).max(MaxTake).default(DefaultTake),
    sortBy: z.enum(Object.values(DocumentSortColumns) as [string, ...string[]]).default(DocumentSortColumns.UPDATED_AT),
    sortOrder: z.enum(Object.values(SortOrder) as [string, ...string[]]).default(SortOrder.DESC),
  })
  .strict();

export type DocumentFilter = z.infer<typeof documentFilterSchema>;
