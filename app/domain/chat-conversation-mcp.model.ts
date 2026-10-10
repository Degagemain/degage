import * as z from 'zod';
import { contentLocales } from '@/i18n/locales';
import { chatConversationChannelSchema, chatMessageRoleSchema } from './chat.model';

export const chatConversationMcpCitationSchema = z
  .object({
    externalId: z.string().nullable(),
    title: z.string(),
  })
  .strict();

export type ChatConversationMcpCitation = z.infer<typeof chatConversationMcpCitationSchema>;

export const chatConversationMcpMessageSchema = z
  .object({
    id: z.uuid(),
    role: chatMessageRoleSchema,
    content: z.string(),
    createdAt: z.coerce.date().nullable(),
    citations: z.array(chatConversationMcpCitationSchema),
  })
  .strict();

export type ChatConversationMcpMessage = z.infer<typeof chatConversationMcpMessageSchema>;

export const chatConversationMcpListItemSchema = z
  .object({
    id: z.uuid(),
    title: z.string(),
    channel: chatConversationChannelSchema,
    locale: z.enum(contentLocales).nullable(),
    noResults: z.boolean(),
    createdAt: z.coerce.date().nullable(),
    updatedAt: z.coerce.date().nullable(),
  })
  .strict();

export type ChatConversationMcpListItem = z.infer<typeof chatConversationMcpListItemSchema>;

export const chatConversationMcpDetailSchema = chatConversationMcpListItemSchema
  .extend({
    messages: z.array(chatConversationMcpMessageSchema),
  })
  .strict();

export type ChatConversationMcpDetail = z.infer<typeof chatConversationMcpDetailSchema>;
