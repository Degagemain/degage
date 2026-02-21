import { CarTaxEuroNormAdjustment } from '@/domain/car-tax-euro-norm-adjustment.model';
import { getPrismaClient } from '@/storage/utils';
import { getRequestContentLocale } from '@/context/request-context';
import { dbCarTaxEuroNormAdjustmentToDomain } from './car-tax-euro-norm-adjustment.mappers';

export const dbCarTaxEuroNormAdjustmentRead = async (id: string): Promise<CarTaxEuroNormAdjustment> => {
  const prisma = getPrismaClient();
  const row = await prisma.carTaxEuroNormAdjustment.findUniqueOrThrow({
    where: { id },
    include: { fiscalRegion: { include: { translations: true } } },
  });
  return dbCarTaxEuroNormAdjustmentToDomain(row, getRequestContentLocale());
};
