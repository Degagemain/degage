import * as z from 'zod';
import { uiLocales } from '@/i18n/locales';

export const translationCatalogLocaleValueSchema = z.object({
  original: z.string().nullable(),
  override: z.string().nullable(),
  variables: z.string().array(),
  updatedAt: z.string().nullable(),
});

export const translationCatalogEntrySchema = z.object({
  key: z.string(),
  segments: z.string().array(),
  values: z.record(z.enum(uiLocales), translationCatalogLocaleValueSchema),
});

export const translationCatalogSchema = z.object({
  locales: z.enum(uiLocales).array(),
  entries: translationCatalogEntrySchema.array(),
});

export type TranslationCatalog = z.infer<typeof translationCatalogSchema>;
