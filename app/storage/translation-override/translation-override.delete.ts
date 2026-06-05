import { type UILocale } from '@/i18n/locales';
import { getPrismaClient } from '@/storage/utils';

export const dbTranslationOverrideDelete = async (key: string, locale: UILocale): Promise<void> => {
  const prisma = getPrismaClient();
  await prisma.translationOverride.deleteMany({
    where: { key, locale },
  });
};

export const dbTranslationOverrideDeleteAll = async (): Promise<number> => {
  const prisma = getPrismaClient();
  const result = await prisma.translationOverride.deleteMany({});
  return result.count;
};
