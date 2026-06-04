import * as z from 'zod';
import { DefaultTake, MaxTake, SortOrder } from './utils';

export enum ChatConversationSortColumns {
  TITLE = 'title',
  CREATED_AT = 'createdAt',
  UPDATED_AT = 'updatedAt',
}

const commaSeparatedArray = <T extends z.ZodTypeAny>(schema: T) =>
  z
    .union([schema.array(), z.string()])
    .transform((val): z.output<T>[] => {
      if (typeof val === 'string') {
        const arr = val ? val.split(',') : [];
        return schema.array().parse(arr);
      }
      return val;
    })
    .default([]);

export const conversationFilterSchema = z
  .object({
    userId: z.string().min(1),
  })
  .strict();

export type ConversationFilter = z.infer<typeof conversationFilterSchema>;

export const adminConversationFilterSchema = z
  .object({
    query: z.string().nullable().default(null),
    userIds: commaSeparatedArray(z.string().min(1)),
    skip: z.coerce.number().int().min(0).default(0),
    take: z.coerce.number().int().min(0).max(MaxTake).default(DefaultTake),
    sortBy: z.enum(Object.values(ChatConversationSortColumns) as [string, ...string[]]).default(ChatConversationSortColumns.UPDATED_AT),
    sortOrder: z.enum(Object.values(SortOrder) as [string, ...string[]]).default(SortOrder.DESC),
  })
  .strict();

export type AdminConversationFilter = z.infer<typeof adminConversationFilterSchema>;
