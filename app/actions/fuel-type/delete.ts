import { dbFuelTypeDelete } from '@/storage/fuel-type/fuel-type.delete';

export const deleteFuelType = async (id: string): Promise<void> => {
  await dbFuelTypeDelete(id);
};
