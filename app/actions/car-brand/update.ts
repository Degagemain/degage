import * as z from 'zod';
import { CarBrand, carBrandSchema } from '@/domain/car-brand.model';
import { dbCarBrandUpdate } from '@/storage/car-brand/car-brand.update';

export const updateCarBrand = async (carBrand: CarBrand): Promise<CarBrand> => {
  const validated = carBrandSchema.parse(carBrand);
  z.uuid().parse(validated.id);
  return dbCarBrandUpdate(validated);
};
