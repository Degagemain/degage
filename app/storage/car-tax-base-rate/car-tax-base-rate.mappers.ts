import { CarTaxBaseRate } from '@/domain/car-tax-base-rate.model';
import { Prisma } from '@/storage/client/client';
import { type ContentLocale, defaultContentLocale } from '@/i18n/locales';

type CarTaxBaseRateWithFiscalRegion = Prisma.CarTaxBaseRateGetPayload<{
  include: { fiscalRegion: { include: { translations: true } } };
}>;

export const dbCarTaxBaseRateToDomain = (row: CarTaxBaseRateWithFiscalRegion, locale: ContentLocale): CarTaxBaseRate => {
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
    maxCc: row.maxCc,
    fiscalPk: row.fiscalPk,
    start: row.start,
    end: row.end,
    rate: Number(row.rate),
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
};
