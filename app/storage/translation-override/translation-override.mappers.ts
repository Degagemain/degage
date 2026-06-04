import { TranslationOverride } from '@/domain/translation-override.model';
import { Prisma } from '@/storage/client/client';

export type DbTranslationOverride = Prisma.TranslationOverrideGetPayload<object>;

export const dbTranslationOverrideToDomain = (override: DbTranslationOverride): TranslationOverride => ({
  id: override.id,
  key: override.key,
  locale: override.locale as TranslationOverride['locale'],
  value: override.value,
  createdAt: override.createdAt,
  updatedAt: override.updatedAt,
});
