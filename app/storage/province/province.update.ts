import { Province } from '@/domain/province.model';
import { getPrismaClient } from '@/storage/utils';
import { getRequestContentLocale } from '@/context/request-context';
import { dbProvinceToDomain, provinceToDbUpdate } from './province.mappers';

export const dbProvinceUpdate = async (province: Province): Promise<Province> => {
  const prisma = getPrismaClient();
  const updated = await prisma.province.update({
    where: { id: province.id! },
    data: provinceToDbUpdate(province),
    include: { fiscalRegion: { include: { translations: true } } },
  });
  return dbProvinceToDomain(updated, getRequestContentLocale());
};
