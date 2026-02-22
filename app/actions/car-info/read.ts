import { CarInfo } from '@/domain/car-info.model';
import { dbCarInfoRead } from '@/storage/car-info/car-info.read';

export const readCarInfo = async (id: string): Promise<CarInfo> => {
  return dbCarInfoRead(id);
};
