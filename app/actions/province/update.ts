import * as z from 'zod';
import { Province, provinceSchema } from '@/domain/province.model';
import { dbProvinceUpdate } from '@/storage/province/province.update';

export const updateProvince = async (province: Province): Promise<Province> => {
  const validated = provinceSchema.parse(province);
  z.uuid().parse(validated.id);
  return dbProvinceUpdate(validated);
};
