import { FiscalRegion } from '@/domain/fiscal-region.model';
import { Prisma } from '@/storage/client/client';
import { type ContentLocale, defaultContentLocale } from '@/i18n/locales';

type FiscalRegionWithTranslations = Prisma.FiscalRegionGetPayload<{ include: { translations: true } }>;

export const dbFiscalRegionToDomain = (fiscalRegion: FiscalRegionWithTranslations, locale: ContentLocale): FiscalRegion => {
  const translation =
    fiscalRegion.translations.find((t) => t.locale === locale) ??
    fiscalRegion.translations.find((t) => t.locale === defaultContentLocale) ??
    fiscalRegion.translations[0];

  return {
    id: fiscalRegion.id,
    code: fiscalRegion.code,
    name: translation?.name ?? fiscalRegion.code,
    isDefault: fiscalRegion.isDefault,
    translations: fiscalRegion.translations.map((t) => ({
      locale: t.locale,
      name: t.name,
    })),
    createdAt: fiscalRegion.createdAt,
    updatedAt: fiscalRegion.updatedAt,
  };
};

export const fiscalRegionToDbCreate = (fiscalRegion: FiscalRegion): Prisma.FiscalRegionCreateInput => {
  return {
    code: fiscalRegion.code,
    isDefault: fiscalRegion.isDefault,
    translations: {
      createMany: {
        data: fiscalRegion.translations.map((t) => ({
          locale: t.locale,
          name: t.name,
        })),
      },
    },
  };
};

export const fiscalRegionToDbUpdate = (fiscalRegion: FiscalRegion): Prisma.FiscalRegionUpdateInput => {
  return {
    code: fiscalRegion.code,
    isDefault: fiscalRegion.isDefault,
    translations: {
      deleteMany: {},
      createMany: {
        data: fiscalRegion.translations.map((t) => ({
          locale: t.locale,
          name: t.name,
        })),
      },
    },
  };
};
