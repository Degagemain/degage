import { FuelType, fuelTypeSchema } from '@/domain/fuel-type.model';
import { dbFuelTypeCreate } from '@/storage/fuel-type/fuel-type.create';

export const createFuelType = async (fuelType: FuelType): Promise<FuelType> => {
  const validated = fuelTypeSchema.parse(fuelType);
  return dbFuelTypeCreate(validated);
};
