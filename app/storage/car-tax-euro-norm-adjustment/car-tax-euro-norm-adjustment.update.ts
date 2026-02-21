import { CarTaxEuroNormAdjustment } from '@/domain/car-tax-euro-norm-adjustment.model';
import { getPrismaClient } from '@/storage/utils';
import { getRequestContentLocale } from '@/context/request-context';
import { carTaxEuroNormAdjustmentToDbUpdate, dbCarTaxEuroNormAdjustmentToDomain } from './car-tax-euro-norm-adjustment.mappers';

export const dbCarTaxEuroNormAdjustmentUpdate = async (adjustment: CarTaxEuroNormAdjustment): Promise<CarTaxEuroNormAdjustment> => {
  const prisma = getPrismaClient();
  const updated = await prisma.carTaxEuroNormAdjustment.update({
    where: { id: adjustment.id! },
    data: carTaxEuroNormAdjustmentToDbUpdate(adjustment),
    include: { fiscalRegion: { include: { translations: true } } },
  });
  return dbCarTaxEuroNormAdjustmentToDomain(updated, getRequestContentLocale());
};
