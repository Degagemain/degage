import { CarType, carTypeSchema } from '@/domain/car-type.model';
import { dbCarTypeCreate } from '@/storage/car-type/car-type.create';

export const createCarType = async (carType: CarType): Promise<CarType> => {
  const validated = carTypeSchema.parse(carType);
  return dbCarTypeCreate(validated);
};
