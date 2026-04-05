import * as z from 'zod';

export const chatUserMessageMaxLength = 4000;
export const chatConversationMediumValues = ['frontend', 'email'] as const;
export const chatConversationMediumSchema = z.enum(chatConversationMediumValues);
export type ChatConversationMedium = z.infer<typeof chatConversationMediumSchema>;
export const chatMessageRoleValues = ['user', 'assistant'] as const;
export const chatMessageRoleSchema = z.enum(chatMessageRoleValues);
export type ChatMessageRole = z.infer<typeof chatMessageRoleSchema>;

export const chatCitationSchema = z
  .object({
    title: z.string().min(1),
    url: z.string().min(1),
  })
  .strict();

export type ChatCitation = z.infer<typeof chatCitationSchema>;

export const chatMessageSchema = z
  .object({
    id: z.uuid().nullable(),
    conversationId: z.uuid(),
    externalId: z.string().min(1).nullable().default(null),
    externalMessageId: z.string().min(1).nullable().default(null),
    role: chatMessageRoleSchema,
    content: z.string(),
    citations: z.array(chatCitationSchema).default([]),
    createdAt: z.coerce.date().nullable().default(null),
  })
  .strict();

export type ChatMessage = z.infer<typeof chatMessageSchema>;

export const chatConversationSchema = z
  .object({
    id: z.uuid().nullable(),
    userId: z.string().min(1).nullable().default(null),
    medium: chatConversationMediumSchema.default('frontend'),
    emailThreadId: z.string().min(1).nullable().default(null),
    title: z.string().default(''),
    messages: z.array(chatMessageSchema).default([]),
    createdAt: z.coerce.date().nullable().default(null),
    updatedAt: z.coerce.date().nullable().default(null),
  })
  .strict();

export type ChatConversation = z.infer<typeof chatConversationSchema>;

export const chatConversationCreateInputSchema = z
  .object({
    userId: chatConversationSchema.shape.userId.optional(),
    medium: chatConversationSchema.shape.medium.optional(),
    emailThreadId: chatConversationSchema.shape.emailThreadId.optional(),
    title: chatConversationSchema.shape.title.optional(),
  })
  .strict();

export type ChatConversationCreateInput = z.infer<typeof chatConversationCreateInputSchema>;

export const chatConversationUpdateInputSchema = z
  .object({
    title: chatConversationSchema.shape.title,
  })
  .strict();

export type ChatConversationUpdateInput = z.infer<typeof chatConversationUpdateInputSchema>;
