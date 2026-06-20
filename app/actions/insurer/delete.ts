import { dbInsurerDelete } from '@/storage/insurer/insurer.delete';

export const deleteInsurer = async (id: string): Promise<void> => {
  return dbInsurerDelete(id);
};
