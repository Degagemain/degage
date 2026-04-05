import { CarInfo } from '@/domain/car-info.model';
import { getPrismaClient } from '@/storage/utils';
import { dbCarInfoToDomainWithRelations } from './car-info.mappers';

export const dbCarInfoRead = async (id: string): Promise<CarInfo> => {
  const prisma = getPrismaClient();
  const ci = await prisma.carInfo.findUniqueOrThrow({
    where: { id },
    include: {
      carType: {
        include: {
          brand: { include: { translations: true } },
          fuelType: { include: { translations: true } },
        },
      },
      euroNorm: true,
    },
  });
  return dbCarInfoToDomainWithRelations(ci);
};
