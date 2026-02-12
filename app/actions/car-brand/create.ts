import { CarBrand, carBrandSchema } from '@/domain/car-brand.model';
import { dbCarBrandCreate } from '@/storage/car-brand/car-brand.create';

export const createCarBrand = async (carBrand: CarBrand): Promise<CarBrand> => {
  const validated = carBrandSchema.parse(carBrand);
  return dbCarBrandCreate(validated);
};
