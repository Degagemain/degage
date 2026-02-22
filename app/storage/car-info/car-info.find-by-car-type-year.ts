import { CarInfo } from '@/domain/car-info.model';
import { getPrismaClient } from '@/storage/utils';
import { dbCarInfoToDomain } from './car-info.mappers';

export const dbCarInfoFindByCarTypeAndYear = async (carTypeId: string, year: number): Promise<CarInfo | null> => {
  const prisma = getPrismaClient();
  const result = await prisma.carInfo.findFirst({
    where: { carTypeId, year },
  });
  return result ? dbCarInfoToDomain(result) : null;
};
