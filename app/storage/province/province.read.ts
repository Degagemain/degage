import { Province } from '@/domain/province.model';
import { getPrismaClient } from '@/storage/utils';
import { dbProvinceToDomain } from './province.mappers';

export const dbProvinceRead = async (id: string): Promise<Province> => {
  const prisma = getPrismaClient();
  const province = await prisma.province.findUniqueOrThrow({
    where: { id },
  });
  return dbProvinceToDomain(province);
};
