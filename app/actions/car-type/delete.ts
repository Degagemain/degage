import { dbCarTypeDelete } from '@/storage/car-type/car-type.delete';

export const deleteCarType = async (id: string): Promise<void> => {
  await dbCarTypeDelete(id);
};
