import { CarType } from '@/domain/car-type.model';
import { dbCarTypeRead } from '@/storage/car-type/car-type.read';

export const readCarType = async (id: string): Promise<CarType> => {
  return dbCarTypeRead(id);
};
