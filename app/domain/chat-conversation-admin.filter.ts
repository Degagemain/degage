import * as z from 'zod';
import { chatConversationMediumSchema } from './chat.model';
import { DefaultTake, MaxTake, SortOrder } from './utils';

export enum ChatConversationAdminSortColumns {
  TITLE = 'title',
  UPDATED_AT = 'updatedAt',
  CREATED_AT = 'createdAt',
}

const commaSeparatedArray = <T extends z.ZodTypeAny>(schema: T) =>
  z
    .union([schema.array(), z.string()])
    .transform((val): z.output<T>[] => {
      if (typeof val === 'string') {
        const arr = val
          ? val
              .split(',')
              .map((item) => item.trim())
              .filter(Boolean)
          : [];
        return schema.array().parse(arr);
      }
      return val;
    })
    .default([]);

export const chatConversationAdminFilterSchema = z
  .object({
    userIds: commaSeparatedArray(z.string().min(1)),
    mediums: commaSeparatedArray(chatConversationMediumSchema),
    skip: z.coerce.number().int().min(0).default(0),
    take: z.coerce.number().int().min(0).max(MaxTake).default(DefaultTake),
    sortBy: z
      .enum(Object.values(ChatConversationAdminSortColumns) as [string, ...string[]])
      .default(ChatConversationAdminSortColumns.UPDATED_AT),
    sortOrder: z.enum(Object.values(SortOrder) as [string, ...string[]]).default(SortOrder.DESC),
  })
  .strict();

export type ChatConversationAdminFilter = z.infer<typeof chatConversationAdminFilterSchema>;
