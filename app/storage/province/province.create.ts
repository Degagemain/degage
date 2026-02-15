import { Province } from '@/domain/province.model';
import { getPrismaClient } from '@/storage/utils';
import { dbProvinceToDomain, provinceToDbCreate } from './province.mappers';

export const dbProvinceCreate = async (province: Province): Promise<Province> => {
  const prisma = getPrismaClient();
  const created = await prisma.province.create({
    data: provinceToDbCreate(province),
  });
  return dbProvinceToDomain(created);
};
