import * as z from 'zod';

export const carTypeTranslationSchema = z.object({
  locale: z.string().min(2).max(5),
  name: z.string().min(1).max(100),
});

export type CarTypeTranslation = z.infer<typeof carTypeTranslationSchema>;

export const carTypeSchema = z
  .object({
    id: z.uuid().nullable(),
    code: z
      .string()
      .min(1)
      .max(50)
      .transform((s) => s.toLowerCase()),
    name: z.string().min(1).max(100),
    isActive: z.boolean().default(true),
    translations: z.array(carTypeTranslationSchema).default([]),
    createdAt: z.date().nullable().default(null),
    updatedAt: z.date().nullable().default(null),
  })
  .strict();

export type CarType = z.infer<typeof carTypeSchema>;
