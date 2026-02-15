import { Province, provinceSchema } from '@/domain/province.model';
import { dbProvinceCreate } from '@/storage/province/province.create';

export const createProvince = async (province: Province): Promise<Province> => {
  const validated = provinceSchema.parse(province);
  return dbProvinceCreate(validated);
};
