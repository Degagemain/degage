import { dbCarTaxEuroNormAdjustmentDelete } from '@/storage/car-tax-euro-norm-adjustment/car-tax-euro-norm-adjustment.delete';

export const deleteCarTaxEuroNormAdjustment = async (id: string): Promise<void> => {
  return dbCarTaxEuroNormAdjustmentDelete(id);
};
