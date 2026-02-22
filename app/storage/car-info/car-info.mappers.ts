import { CarInfo } from '@/domain/car-info.model';
import { Prisma } from '@/storage/client/client';
import { type ContentLocale, defaultContentLocale } from '@/i18n/locales';
import { getRequestContentLocale } from '@/context/request-context';

type CarInfoDb = Prisma.CarInfoGetPayload<object>;

type CarInfoWithRelations = Prisma.CarInfoGetPayload<{
  include: {
    carType: {
      include: {
        brand: { include: { translations: true } };
        fuelType: { include: { translations: true } };
      };
    };
    euroNorm: true;
  };
}>;

const pickTranslationName = (translations: { locale: string; name: string }[], locale: ContentLocale): string => {
  const t = translations.find((x) => x.locale === locale) ?? translations.find((x) => x.locale === defaultContentLocale) ?? translations[0];
  return t?.name ?? '';
};

export const dbCarInfoToDomain = (db: CarInfoDb): CarInfo => {
  return {
    id: db.id,
    carType: { id: db.carTypeId },
    year: db.year,
    cylinderCc: db.cylinderCc,
    co2Emission: db.co2Emission,
    ecoscore: db.ecoscore,
    euroNormId: db.euroNormId,
    consumption: db.consumption,
    createdAt: db.createdAt,
    updatedAt: db.updatedAt,
  };
};

export const dbCarInfoToDomainWithRelations = (db: CarInfoWithRelations): CarInfo => {
  const locale = getRequestContentLocale();
  return {
    ...dbCarInfoToDomain(db),
    carType: {
      id: db.carTypeId,
      name: db.carType.name,
      brand: {
        id: db.carType.brandId,
        name: pickTranslationName(db.carType.brand.translations, locale),
      },
      fuelType: {
        id: db.carType.fuelTypeId,
        name: pickTranslationName(db.carType.fuelType.translations, locale),
      },
    },
    euroNorm: db.euroNorm ? { id: db.euroNorm.id, name: db.euroNorm.code } : undefined,
  };
};

export const carInfoToDbCreate = (ci: CarInfo): Prisma.CarInfoCreateInput => {
  return {
    carType: { connect: { id: ci.carType.id } },
    year: ci.year,
    cylinderCc: ci.cylinderCc,
    co2Emission: ci.co2Emission,
    ecoscore: ci.ecoscore,
    euroNorm: ci.euroNormId ? { connect: { id: ci.euroNormId } } : undefined,
    consumption: ci.consumption,
  };
};

export const carInfoToDbUpdate = (ci: CarInfo): Prisma.CarInfoUpdateInput => {
  return {
    carType: { connect: { id: ci.carType.id } },
    year: ci.year,
    cylinderCc: ci.cylinderCc,
    co2Emission: ci.co2Emission,
    ecoscore: ci.ecoscore,
    euroNorm: ci.euroNormId ? { connect: { id: ci.euroNormId } } : { disconnect: true },
    consumption: ci.consumption,
  };
};
