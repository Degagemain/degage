import { TranslationOverride, TranslationOverrideInput } from '@/domain/translation-override.model';
import { getPrismaClient } from '@/storage/utils';
import { dbTranslationOverrideToDomain } from './translation-override.mappers';

export const dbTranslationOverrideUpsert = async (override: TranslationOverrideInput): Promise<TranslationOverride> => {
  const prisma = getPrismaClient();
  const updated = await prisma.translationOverride.upsert({
    where: {
      key_locale: {
        key: override.key,
        locale: override.locale,
      },
    },
    create: override,
    update: {
      value: override.value,
    },
  });
  return dbTranslationOverrideToDomain(updated);
};
