import * as z from 'zod';

export const carBrandTranslationSchema = z.object({
  locale: z.string().min(2).max(5),
  name: z.string().min(1).max(100),
});

export type CarBrandTranslation = z.infer<typeof carBrandTranslationSchema>;

export const carBrandSchema = z
  .object({
    id: z.uuid().nullable(),
    code: z
      .string()
      .min(1)
      .max(50)
      .transform((s) => s.toLowerCase()),
    name: z.string().min(1).max(100),
    isActive: z.boolean().default(true),
    translations: z.array(carBrandTranslationSchema).default([]),
    createdAt: z.date().nullable().default(null),
    updatedAt: z.date().nullable().default(null),
  })
  .strict();

export type CarBrand = z.infer<typeof carBrandSchema>;
