import { CarInfo } from '@/domain/car-info.model';
import { getPrismaClient } from '@/storage/utils';
import { carInfoToDbCreate, dbCarInfoToDomain } from './car-info.mappers';

export const dbCarInfoCreate = async (ci: CarInfo): Promise<CarInfo> => {
  const prisma = getPrismaClient();
  const created = await prisma.carInfo.create({
    data: carInfoToDbCreate(ci),
  });
  return dbCarInfoToDomain(created);
};
