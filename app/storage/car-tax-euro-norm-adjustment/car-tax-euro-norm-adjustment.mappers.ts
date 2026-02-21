import { CarTaxEuroNormAdjustment } from '@/domain/car-tax-euro-norm-adjustment.model';
import { Prisma } from '@/storage/client/client';
import { type ContentLocale, defaultContentLocale } from '@/i18n/locales';

type CarTaxEuroNormAdjustmentWithFiscalRegion = Prisma.CarTaxEuroNormAdjustmentGetPayload<{
  include: { fiscalRegion: { include: { translations: true } } };
}>;

export const dbCarTaxEuroNormAdjustmentToDomain = (
  row: CarTaxEuroNormAdjustmentWithFiscalRegion,
  locale: ContentLocale,
): CarTaxEuroNormAdjustment => {
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
    euroNormGroup: row.euroNormGroup,
    defaultAdjustment: Number(row.defaultAdjustment),
    dieselAdjustment: Number(row.dieselAdjustment),
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
};

export const carTaxEuroNormAdjustmentToDbCreate = (adjustment: CarTaxEuroNormAdjustment): Prisma.CarTaxEuroNormAdjustmentCreateInput => ({
  fiscalRegion: { connect: { id: adjustment.fiscalRegion.id } },
  euroNormGroup: adjustment.euroNormGroup,
  defaultAdjustment: adjustment.defaultAdjustment,
  dieselAdjustment: adjustment.dieselAdjustment,
});

export const carTaxEuroNormAdjustmentToDbUpdate = (adjustment: CarTaxEuroNormAdjustment): Prisma.CarTaxEuroNormAdjustmentUpdateInput => ({
  fiscalRegion: { connect: { id: adjustment.fiscalRegion.id } },
  euroNormGroup: adjustment.euroNormGroup,
  defaultAdjustment: adjustment.defaultAdjustment,
  dieselAdjustment: adjustment.dieselAdjustment,
});
