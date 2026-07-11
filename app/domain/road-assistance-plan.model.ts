import * as z from 'zod';

export const roadAssistancePlanTranslationSchema = z.object({
  locale: z.string().min(2).max(5),
  name: z.string().min(1).max(200),
  description: z.string().max(2000).default(''),
});

export type RoadAssistancePlanTranslation = z.infer<typeof roadAssistancePlanTranslationSchema>;

export const roadAssistancePlanSchema = z
  .object({
    id: z.uuid().nullable(),
    name: z.string().min(1).max(200),
    description: z.string().max(2000).default(''),
    isActive: z.boolean().default(true),
    translations: z.array(roadAssistancePlanTranslationSchema).default([]),
    createdAt: z.coerce.date().nullable().default(null),
    updatedAt: z.coerce.date().nullable().default(null),
  })
  .strict();

export type RoadAssistancePlan = z.infer<typeof roadAssistancePlanSchema>;
