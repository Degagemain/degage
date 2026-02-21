import * as z from 'zod';
import { CarTaxEuroNormAdjustment, carTaxEuroNormAdjustmentSchema } from '@/domain/car-tax-euro-norm-adjustment.model';
import { dbCarTaxEuroNormAdjustmentUpdate } from '@/storage/car-tax-euro-norm-adjustment/car-tax-euro-norm-adjustment.update';

export const updateCarTaxEuroNormAdjustment = async (adjustment: CarTaxEuroNormAdjustment): Promise<CarTaxEuroNormAdjustment> => {
  const validated = carTaxEuroNormAdjustmentSchema.parse(adjustment);
  z.uuid().parse(validated.id);
  return dbCarTaxEuroNormAdjustmentUpdate(validated);
};
