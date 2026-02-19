import { CarPriceEstimate } from '@/domain/car-price-estimate.model';
import { Prisma } from '@/storage/client/client';
import { type ContentLocale, defaultContentLocale } from '@/i18n/locales';
import { getRequestContentLocale } from '@/context/request-context';

type CarPriceEstimateDb = Prisma.CarPriceEstimateGetPayload<object>;

type CarPriceEstimateWithCarType = Prisma.CarPriceEstimateGetPayload<{
  include: { carType: { include: { brand: { include: { translations: true } } } } };
}>;

export const dbCarPriceEstimateToDomain = (db: CarPriceEstimateDb): CarPriceEstimate => {
  return {
    id: db.id,
    carType: { id: db.carTypeId },
    year: db.year,
    price: Number(db.price),
    rangeMin: Number(db.rangeMin),
    rangeMax: Number(db.rangeMax),
    prompt: db.prompt,
    remarks: db.remarks,
    articleRefs: db.articleRefs,
    createdAt: db.createdAt,
    updatedAt: db.updatedAt,
  };
};

const pickTranslationName = (translations: { locale: string; name: string }[], locale: ContentLocale): string => {
  const t = translations.find((x) => x.locale === locale) ?? translations.find((x) => x.locale === defaultContentLocale) ?? translations[0];
  return t?.name ?? '';
};

export const dbCarPriceEstimateToDomainWithRelations = (db: CarPriceEstimateWithCarType): CarPriceEstimate => {
  const locale = getRequestContentLocale();
  return {
    ...dbCarPriceEstimateToDomain(db),
    carType: {
      id: db.carTypeId,
      name: db.carType.name,
      brand: {
        id: db.carType.brandId,
        name: pickTranslationName(db.carType.brand.translations, locale),
      },
    },
  };
};

export const carPriceEstimateToDbCreate = (cpe: CarPriceEstimate): Prisma.CarPriceEstimateCreateInput => {
  return {
    carType: { connect: { id: cpe.carType.id } },
    year: cpe.year,
    price: cpe.price,
    rangeMin: cpe.rangeMin,
    rangeMax: cpe.rangeMax,
    prompt: cpe.prompt,
    remarks: cpe.remarks,
    articleRefs: cpe.articleRefs,
  };
};

export const carPriceEstimateToDbUpdate = (cpe: CarPriceEstimate): Prisma.CarPriceEstimateUpdateInput => {
  return {
    carType: { connect: { id: cpe.carType.id } },
    year: cpe.year,
    price: cpe.price,
    rangeMin: cpe.rangeMin,
    rangeMax: cpe.rangeMax,
    prompt: cpe.prompt,
    remarks: cpe.remarks,
    articleRefs: cpe.articleRefs,
  };
};
