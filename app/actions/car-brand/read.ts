import { CarBrand } from '@/domain/car-brand.model';
import { dbCarBrandRead } from '@/storage/car-brand/car-brand.read';

export const readCarBrand = async (id: string): Promise<CarBrand> => {
  return dbCarBrandRead(id);
};
