import * as z from 'zod';
import { FuelType, fuelTypeSchema } from '@/domain/fuel-type.model';
import { dbFuelTypeUpdate } from '@/storage/fuel-type/fuel-type.update';

export const updateFuelType = async (fuelType: FuelType): Promise<FuelType> => {
  const validated = fuelTypeSchema.parse(fuelType);
  z.uuid().parse(validated.id);
  return dbFuelTypeUpdate(validated);
};
