import * as z from 'zod';
import { uiLocales } from '@/i18n/locales';

export const translationOverrideSchema = z.object({
  id: z.uuid().nullable(),
  key: z.string().min(1).max(300),
  locale: z.enum(uiLocales),
  value: z.string(),
  createdAt: z.date().nullable().default(null),
  updatedAt: z.date().nullable().default(null),
});

export const translationOverrideInputSchema = translationOverrideSchema.pick({
  key: true,
  locale: true,
  value: true,
});

export type TranslationOverride = z.infer<typeof translationOverrideSchema>;
export type TranslationOverrideInput = z.infer<typeof translationOverrideInputSchema>;
