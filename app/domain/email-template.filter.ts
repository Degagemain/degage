import * as z from 'zod';
import { DefaultTake, MaxTake, SortOrder } from './utils';

export enum EmailTemplateSortColumns {
  CODE = 'code',
  DESIGN_ID = 'designId',
  CREATED_AT = 'createdAt',
  UPDATED_AT = 'updatedAt',
}

export const emailTemplateFilterSchema = z
  .object({
    query: z.string().nullable().default(null),
    skip: z.coerce.number().int().min(0).default(0),
    take: z.coerce.number().int().min(0).max(MaxTake).default(DefaultTake),
    sortBy: z.enum(Object.values(EmailTemplateSortColumns) as [string, ...string[]]).default(EmailTemplateSortColumns.CODE),
    sortOrder: z.enum(Object.values(SortOrder) as [string, ...string[]]).default(SortOrder.ASC),
  })
  .strict();

export type EmailTemplateFilter = z.infer<typeof emailTemplateFilterSchema>;
