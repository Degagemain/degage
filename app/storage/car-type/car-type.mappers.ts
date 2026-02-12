import { CarType } from '@/domain/car-type.model';
import { Prisma } from '@/storage/client/client';
import { type ContentLocale, defaultContentLocale } from '@/i18n/locales';

type CarTypeWithTranslations = Prisma.CarTypeGetPayload<{ include: { translations: true } }>;

export const dbCarTypeToDomain = (carType: CarTypeWithTranslations, locale: ContentLocale): CarType => {
  const translation =
    carType.translations.find((t) => t.locale === locale) ??
    carType.translations.find((t) => t.locale === defaultContentLocale) ??
    carType.translations[0];

  return {
    id: carType.id,
    code: carType.code,
    name: translation?.name ?? carType.code,
    isActive: carType.isActive,
    translations: carType.translations.map((t) => ({
      locale: t.locale,
      name: t.name,
    })),
    createdAt: carType.createdAt,
    updatedAt: carType.updatedAt,
  };
};

export const carTypeToDbCreate = (carType: CarType): Prisma.CarTypeCreateInput => {
  return {
    code: carType.code.toLowerCase(),
    isActive: carType.isActive,
    translations: {
      createMany: {
        data: carType.translations.map((t) => ({
          locale: t.locale,
          name: t.name,
        })),
      },
    },
  };
};

export const carTypeToDbUpdate = (carType: CarType): Prisma.CarTypeUpdateInput => {
  return {
    code: carType.code.toLowerCase(),
    isActive: carType.isActive,
    translations: {
      deleteMany: {},
      createMany: {
        data: carType.translations.map((t) => ({
          locale: t.locale,
          name: t.name,
        })),
      },
    },
  };
};
