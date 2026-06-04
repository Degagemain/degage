import { TranslationOverride } from '@/domain/translation-override.model';
import { type UILocale } from '@/i18n/locales';
import { getPrismaClient } from '@/storage/utils';
import { dbTranslationOverrideToDomain } from './translation-override.mappers';

export const dbTranslationOverrideList = async (): Promise<TranslationOverride[]> => {
  const prisma = getPrismaClient();
  const overrides = await prisma.translationOverride.findMany({
    orderBy: [{ key: 'asc' }, { locale: 'asc' }],
  });
  return overrides.map(dbTranslationOverrideToDomain);
};

export const dbTranslationOverrideListForLocale = async (locale: UILocale): Promise<TranslationOverride[]> => {
  const prisma = getPrismaClient();
  const overrides = await prisma.translationOverride.findMany({
    where: { locale },
    orderBy: { key: 'asc' },
  });
  return overrides.map(dbTranslationOverrideToDomain);
};
