import * as z from 'zod';

import { idNameSchema } from '@/domain/id-name.model';

export const carStickerSchema = z
  .object({
    id: z.uuid().nullable(),
    name: z.string().min(1).max(100),
    isActive: z.boolean().default(true),
    isAlwaysIncluded: z.boolean().default(false),
    image: idNameSchema.nullable().default(null),
    createdAt: z.coerce.date().nullable().default(null),
    updatedAt: z.coerce.date().nullable().default(null),
  })
  .strict();

export type CarSticker = z.infer<typeof carStickerSchema>;
