import * as z from 'zod';

export const conversationFilterSchema = z
  .object({
    userId: z.string().min(1),
  })
  .strict();

export type ConversationFilter = z.infer<typeof conversationFilterSchema>;
