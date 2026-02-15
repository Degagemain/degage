import { Province } from '@/domain/province.model';
import { dbProvinceRead } from '@/storage/province/province.read';

export const readProvince = async (id: string): Promise<Province> => {
  return dbProvinceRead(id);
};
