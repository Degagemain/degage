import { FuelType } from '@/domain/fuel-type.model';
import { dbFuelTypeRead } from '@/storage/fuel-type/fuel-type.read';

export const readFuelType = async (id: string): Promise<FuelType> => {
  return dbFuelTypeRead(id);
};
