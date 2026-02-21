import { FuelType } from '@/domain/fuel-type.model';
import { Prisma } from '@/storage/client/client';
import { type ContentLocale, defaultContentLocale } from '@/i18n/locales';

type FuelTypeWithTranslations = Prisma.FuelTypeGetPayload<{ include: { translations: true } }>;

export const dbFuelTypeToDomain = (fuelType: FuelTypeWithTranslations, locale: ContentLocale): FuelType => {
  const translation =
    fuelType.translations.find((t) => t.locale === locale) ??
    fuelType.translations.find((t) => t.locale === defaultContentLocale) ??
    fuelType.translations[0];

  return {
    id: fuelType.id,
    code: fuelType.code,
    name: translation?.name ?? fuelType.code,
    isActive: fuelType.isActive,
    pricePer: Number(fuelType.pricePer),
    co2Contribution: fuelType.co2Contribution,
    translations: fuelType.translations.map((t) => ({
      locale: t.locale,
      name: t.name,
    })),
    createdAt: fuelType.createdAt,
    updatedAt: fuelType.updatedAt,
  };
};

export const fuelTypeToDbCreate = (fuelType: FuelType): Prisma.FuelTypeCreateInput => {
  return {
    code: fuelType.code,
    isActive: fuelType.isActive,
    pricePer: fuelType.pricePer,
    co2Contribution: fuelType.co2Contribution,
    translations: {
      createMany: {
        data: fuelType.translations.map((t) => ({
          locale: t.locale,
          name: t.name,
        })),
      },
    },
  };
};

export const fuelTypeToDbUpdate = (fuelType: FuelType): Prisma.FuelTypeUpdateInput => {
  return {
    code: fuelType.code,
    isActive: fuelType.isActive,
    pricePer: fuelType.pricePer,
    co2Contribution: fuelType.co2Contribution,
    translations: {
      deleteMany: {},
      createMany: {
        data: fuelType.translations.map((t) => ({
          locale: t.locale,
          name: t.name,
        })),
      },
    },
  };
};
