import * as z from 'zod';
import { CarType, carTypeSchema } from '@/domain/car-type.model';
import { dbCarTypeUpdate } from '@/storage/car-type/car-type.update';

export const updateCarType = async (carType: CarType): Promise<CarType> => {
  const validated = carTypeSchema.parse(carType);
  z.uuid().parse(validated.id);
  return dbCarTypeUpdate(validated);
};
