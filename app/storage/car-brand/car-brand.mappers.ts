import { CarBrand } from '@/domain/car-brand.model';
import { Prisma } from '@/storage/client/client';
import { type ContentLocale, defaultContentLocale } from '@/i18n/locales';

type CarBrandWithTranslations = Prisma.CarBrandGetPayload<{ include: { translations: true } }>;

export const dbCarBrandToDomain = (carBrand: CarBrandWithTranslations, locale: ContentLocale): CarBrand => {
  const translation =
    carBrand.translations.find((t) => t.locale === locale) ??
    carBrand.translations.find((t) => t.locale === defaultContentLocale) ??
    carBrand.translations[0];

  return {
    id: carBrand.id,
    code: carBrand.code,
    name: translation?.name ?? carBrand.code,
    isActive: carBrand.isActive,
    translations: carBrand.translations.map((t) => ({
      locale: t.locale,
      name: t.name,
    })),
    createdAt: carBrand.createdAt,
    updatedAt: carBrand.updatedAt,
  };
};

export const carBrandToDbCreate = (carBrand: CarBrand): Prisma.CarBrandCreateInput => {
  return {
    code: carBrand.code.toLowerCase(),
    isActive: carBrand.isActive,
    translations: {
      createMany: {
        data: carBrand.translations.map((t) => ({
          locale: t.locale,
          name: t.name,
        })),
      },
    },
  };
};

export const carBrandToDbUpdate = (carBrand: CarBrand): Prisma.CarBrandUpdateInput => {
  return {
    code: carBrand.code.toLowerCase(),
    isActive: carBrand.isActive,
    translations: {
      deleteMany: {},
      createMany: {
        data: carBrand.translations.map((t) => ({
          locale: t.locale,
          name: t.name,
        })),
      },
    },
  };
};
