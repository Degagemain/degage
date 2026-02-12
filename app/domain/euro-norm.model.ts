import * as z from 'zod';

export const euroNormSchema = z
  .object({
    id: z.uuid().nullable(),
    code: z
      .string()
      .min(1)
      .max(50)
      .transform((s) => s.toLowerCase().replace(/\s+/g, '-')),
    name: z.string().min(1).max(100),
    isActive: z.boolean().default(true),
    start: z.coerce.date(),
    end: z.coerce.date().nullable().default(null),
    createdAt: z.date().nullable().default(null),
    updatedAt: z.date().nullable().default(null),
  })
  .strict();

export type EuroNorm = z.infer<typeof euroNormSchema>;
