import { CarTaxEuroNormAdjustment, carTaxEuroNormAdjustmentSchema } from '@/domain/car-tax-euro-norm-adjustment.model';
import { dbCarTaxEuroNormAdjustmentCreate } from '@/storage/car-tax-euro-norm-adjustment/car-tax-euro-norm-adjustment.create';

export const createCarTaxEuroNormAdjustment = async (adjustment: CarTaxEuroNormAdjustment): Promise<CarTaxEuroNormAdjustment> => {
  const validated = carTaxEuroNormAdjustmentSchema.parse(adjustment);
  return dbCarTaxEuroNormAdjustmentCreate(validated);
};
