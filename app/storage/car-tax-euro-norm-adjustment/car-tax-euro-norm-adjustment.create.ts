import { CarTaxEuroNormAdjustment } from '@/domain/car-tax-euro-norm-adjustment.model';
import { getPrismaClient } from '@/storage/utils';
import { getRequestContentLocale } from '@/context/request-context';
import { carTaxEuroNormAdjustmentToDbCreate, dbCarTaxEuroNormAdjustmentToDomain } from './car-tax-euro-norm-adjustment.mappers';

export const dbCarTaxEuroNormAdjustmentCreate = async (adjustment: CarTaxEuroNormAdjustment): Promise<CarTaxEuroNormAdjustment> => {
  const prisma = getPrismaClient();
  const created = await prisma.carTaxEuroNormAdjustment.create({
    data: carTaxEuroNormAdjustmentToDbCreate(adjustment),
    include: { fiscalRegion: { include: { translations: true } } },
  });
  return dbCarTaxEuroNormAdjustmentToDomain(created, getRequestContentLocale());
};
