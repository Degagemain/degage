import { CarInfo } from '@/domain/car-info.model';
import { getPrismaClient } from '@/storage/utils';
import { carInfoToDbUpdate, dbCarInfoToDomain } from './car-info.mappers';

export const dbCarInfoUpdate = async (ci: CarInfo): Promise<CarInfo> => {
  const prisma = getPrismaClient();
  const updated = await prisma.carInfo.update({
    where: { id: ci.id! },
    data: carInfoToDbUpdate(ci),
  });
  return dbCarInfoToDomain(updated);
};
