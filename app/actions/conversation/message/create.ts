import * as z from 'zod';
import { chatCitationSchema, chatMessageRoleSchema, chatUserMessageMaxLength } from '@/domain/chat.model';
import { dbChatMessageCreate } from '@/storage/conversation/message/create';

const createMessageInputSchema = z
  .object({
    conversationId: z.uuid(),
    externalId: z.string().min(1).nullable().optional().default(null),
    externalMessageId: z.string().min(1).nullable().optional().default(null),
    role: chatMessageRoleSchema,
    content: z.string().min(1).max(chatUserMessageMaxLength),
    citations: z.array(chatCitationSchema).optional().default([]),
  })
  .strict();

export const createMessage = async (input: {
  conversationId: string;
  externalId?: string | null;
  externalMessageId?: string | null;
  role: z.infer<typeof chatMessageRoleSchema>;
  content: string;
  citations?: z.infer<typeof chatCitationSchema>[];
}): Promise<void> => {
  const validated = createMessageInputSchema.parse(input);
  return dbChatMessageCreate(validated);
};
