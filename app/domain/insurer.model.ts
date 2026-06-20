import * as z from 'zod';

export const insurerSchema = z
  .object({
    id: z.uuid().nullable(),
    name: z.string().min(1).max(100),
    createdAt: z.coerce.date().nullable().default(null),
    updatedAt: z.coerce.date().nullable().default(null),
  })
  .strict();

export type Insurer = z.infer<typeof insurerSchema>;
