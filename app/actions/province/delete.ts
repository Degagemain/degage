import { dbProvinceDelete } from '@/storage/province/province.delete';

export const deleteProvince = async (id: string): Promise<void> => {
  await dbProvinceDelete(id);
};
