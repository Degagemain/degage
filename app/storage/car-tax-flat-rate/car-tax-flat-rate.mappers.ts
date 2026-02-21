import { CarTaxFlatRate } from '@/domain/car-tax-flat-rate.model';
import { Prisma } from '@/storage/client/client';
import { type ContentLocale, defaultContentLocale } from '@/i18n/locales';

type CarTaxFlatRateWithFiscalRegion = Prisma.CarTaxFlatRateGetPayload<{
  include: { fiscalRegion: { include: { translations: true } } };
}>;

export const dbCarTaxFlatRateToDomain = (row: CarTaxFlatRateWithFiscalRegion, locale: ContentLocale): CarTaxFlatRate => {
  const translation =
    row.fiscalRegion.translations.find((t) => t.locale === locale) ??
    row.fiscalRegion.translations.find((t) => t.locale === defaultContentLocale) ??
    row.fiscalRegion.translations[0];
  return {
    id: row.id,
    fiscalRegion: {
      id: row.fiscalRegion.id,
      name: translation?.name ?? row.fiscalRegion.code,
    },
    start: row.start,
    rate: Number(row.rate),
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
};
