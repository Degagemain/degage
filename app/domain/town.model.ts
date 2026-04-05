import * as z from 'zod';

import { idNameSchema } from '@/domain/id-name.model';

export const townSchema = z
  .object({
    id: z.uuid().nullable(),
    zip: z.string().min(1).max(20),
    name: z.string().min(1).max(200),
    municipality: z.string().min(1).max(200),
    province: idNameSchema,
    hub: idNameSchema,
    highDemand: z.boolean().default(false),
    hasActiveMembers: z.boolean().default(false),
    createdAt: z.coerce.date().nullable().default(null),
    updatedAt: z.coerce.date().nullable().default(null),
  })
  .strict();

export type Town = z.infer<typeof townSchema>;
