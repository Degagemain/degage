import * as z from 'zod';
import { contentLocales } from '@/i18n/locales';
import { chatConversationChannelSchema } from './chat.model';
import { DefaultTake, MaxTake, SortOrder } from './utils';

export enum ChatConversationMcpSortColumns {
  CREATED_AT = 'createdAt',
  UPDATED_AT = 'updatedAt',
}

const emptyToNull = (value: string | null | undefined): string | null => {
  if (value == null) return null;
  const trimmed = value.trim();
  return trimmed.length === 0 ? null : trimmed;
};

const parseRangeBound = (value: string | null | undefined, bound: 'from' | 'to'): Date | null => {
  const normalized = emptyToNull(value);
  if (!normalized) return null;
  const dateOnly = /^\d{4}-\d{2}-\d{2}$/.test(normalized);
  const iso = dateOnly ? `${normalized}${bound === 'from' ? 'T00:00:00.000Z' : 'T23:59:59.999Z'}` : normalized;
  const parsed = new Date(iso);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const rawChatConversationMcpFilterSchema = z
  .object({
    from: z.string().nullable().optional(),
    to: z.string().nullable().optional(),
    locale: z.enum(contentLocales).nullable().optional(),
    channel: chatConversationChannelSchema.nullable().optional(),
    noResults: z.boolean().nullable().optional(),
    skip: z.coerce.number().int().min(0).default(0),
    take: z.coerce.number().int().min(0).max(MaxTake).default(DefaultTake),
    sortBy: z
      .enum([ChatConversationMcpSortColumns.CREATED_AT, ChatConversationMcpSortColumns.UPDATED_AT])
      .default(ChatConversationMcpSortColumns.CREATED_AT),
    sortOrder: z.enum([SortOrder.ASC, SortOrder.DESC]).default(SortOrder.DESC),
  })
  .strict();

export const chatConversationMcpFilterSchema = rawChatConversationMcpFilterSchema
  .superRefine((value, ctx) => {
    if (emptyToNull(value.from) && !parseRangeBound(value.from, 'from')) {
      ctx.addIssue({ code: 'custom', message: 'Invalid from date', path: ['from'] });
    }
    if (emptyToNull(value.to) && !parseRangeBound(value.to, 'to')) {
      ctx.addIssue({ code: 'custom', message: 'Invalid to date', path: ['to'] });
    }
  })
  .transform((value) => ({
    from: parseRangeBound(value.from, 'from'),
    to: parseRangeBound(value.to, 'to'),
    locale: value.locale ?? null,
    channel: value.channel ?? null,
    noResults: value.noResults ?? null,
    skip: value.skip,
    take: value.take,
    sortBy: value.sortBy,
    sortOrder: value.sortOrder,
  }));

export type ChatConversationMcpFilter = z.infer<typeof chatConversationMcpFilterSchema>;
