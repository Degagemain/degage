import * as z from 'zod';

export const fiscalRegionTranslationSchema = z.object({
  locale: z.string().min(2).max(5),
  name: z.string().min(1).max(100),
});

export type FiscalRegionTranslation = z.infer<typeof fiscalRegionTranslationSchema>;

export const fiscalRegionSchema = z
  .object({
    id: z.uuid().nullable(),
    code: z.string().min(1).max(50),
    name: z.string().min(1).max(100),
    isDefault: z.boolean().default(true),
    translations: z.array(fiscalRegionTranslationSchema).default([]),
    createdAt: z.date().nullable().default(null),
    updatedAt: z.date().nullable().default(null),
  })
  .strict();

export type FiscalRegion = z.infer<typeof fiscalRegionSchema>;
