import { dbInsurerRead } from '@/storage/insurer/insurer.read';

export const readInsurer = async (id: string) => {
  return dbInsurerRead(id);
};
