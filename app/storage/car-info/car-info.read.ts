import { CarInfo } from '@/domain/car-info.model';
import { getPrismaClient } from '@/storage/utils';
import { dbCarInfoToDomain } from './car-info.mappers';

export const dbCarInfoRead = async (id: string): Promise<CarInfo> => {
  const prisma = getPrismaClient();
  const ci = await prisma.carInfo.findUniqueOrThrow({
    where: { id },
  });
  return dbCarInfoToDomain(ci);
};
