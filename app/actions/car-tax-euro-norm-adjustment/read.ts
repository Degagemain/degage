import { CarTaxEuroNormAdjustment } from '@/domain/car-tax-euro-norm-adjustment.model';
import { dbCarTaxEuroNormAdjustmentRead } from '@/storage/car-tax-euro-norm-adjustment/car-tax-euro-norm-adjustment.read';

export const readCarTaxEuroNormAdjustment = async (id: string): Promise<CarTaxEuroNormAdjustment> => {
  return dbCarTaxEuroNormAdjustmentRead(id);
};
