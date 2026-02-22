import { CarInfo, carInfoSchema } from '@/domain/car-info.model';
import { dbCarInfoCreate } from '@/storage/car-info/car-info.create';

export const createCarInfo = async (ci: CarInfo): Promise<CarInfo> => {
  const validated = carInfoSchema.parse(ci);
  return dbCarInfoCreate(validated);
};
