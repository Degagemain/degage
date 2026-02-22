import { dbCarInfoDelete } from '@/storage/car-info/car-info.delete';

export const deleteCarInfo = async (id: string): Promise<void> => {
  await dbCarInfoDelete(id);
};
