import * as z from 'zod';

export const documentationGroupTranslationSchema = z.object({
  locale: z.string().min(2).max(5),
  name: z.string().min(1).max(200),
});

export type DocumentationGroupTranslation = z.infer<typeof documentationGroupTranslationSchema>;

export const documentationGroupSchema = z
  .object({
    id: z.uuid().nullable(),
    order: z.number().int().default(0),
    name: z.string().min(1).max(200),
    translations: z.array(documentationGroupTranslationSchema).min(1),
    createdAt: z.coerce.date().nullable().default(null),
    updatedAt: z.coerce.date().nullable().default(null),
  })
  .strict();

export type DocumentationGroup = z.infer<typeof documentationGroupSchema>;
