import { CarType } from '@/domain/car-type.model';
import { Prisma } from '@/storage/client/client';
import { type ContentLocale, defaultContentLocale } from '@/i18n/locales';

type CarTypeDb = Prisma.CarTypeGetPayload<object>;

type CarTypeWithRelations = Prisma.CarTypeGetPayload<{
  include: { brand: { include: { translations: true } }; fuelType: { include: { translations: true } } };
}>;

const pickTranslationName = (translations: { locale: string; name: string }[], locale: ContentLocale): string => {
  const t = translations.find((x) => x.locale === locale) ?? translations.find((x) => x.locale === defaultContentLocale) ?? translations[0];
  return t?.name ?? '';
};

export const dbCarTypeToDomain = (carType: CarTypeDb): CarType => {
  return {
    id: carType.id,
    brand: { id: carType.brandId, name: '' },
    fuelType: { id: carType.fuelTypeId, name: '' },
    name: carType.name,
    ecoscore: carType.ecoscore,
    isActive: carType.isActive,
    createdAt: carType.createdAt,
    updatedAt: carType.updatedAt,
  };
};

export const dbCarTypeToDomainWithRelations = (carType: CarTypeWithRelations, locale: ContentLocale): CarType => {
  return {
    ...dbCarTypeToDomain(carType),
    brand: {
      id: carType.brandId,
      name: pickTranslationName(carType.brand.translations, locale),
    },
    fuelType: {
      id: carType.fuelTypeId,
      name: pickTranslationName(carType.fuelType.translations, locale),
    },
  };
};

export const carTypeToDbCreate = (carType: CarType): Prisma.CarTypeCreateInput => {
  return {
    brand: { connect: { id: carType.brand.id } },
    fuelType: { connect: { id: carType.fuelType.id } },
    name: carType.name,
    ecoscore: carType.ecoscore,
    isActive: carType.isActive,
  };
};

export const carTypeToDbUpdate = (carType: CarType): Prisma.CarTypeUpdateInput => {
  return {
    brand: { connect: { id: carType.brand.id } },
    fuelType: { connect: { id: carType.fuelType.id } },
    name: carType.name,
    ecoscore: carType.ecoscore,
    isActive: carType.isActive,
  };
};
