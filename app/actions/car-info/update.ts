import * as z from 'zod';
import { CarInfo, carInfoSchema } from '@/domain/car-info.model';
import { dbCarInfoUpdate } from '@/storage/car-info/car-info.update';

export const updateCarInfo = async (ci: CarInfo): Promise<CarInfo> => {
  const validated = carInfoSchema.parse(ci);
  z.uuid().parse(validated.id);
  return dbCarInfoUpdate(validated);
};
