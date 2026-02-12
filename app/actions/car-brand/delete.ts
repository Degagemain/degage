import { dbCarBrandDelete } from '@/storage/car-brand/car-brand.delete';

export const deleteCarBrand = async (id: string): Promise<void> => {
  await dbCarBrandDelete(id);
};
