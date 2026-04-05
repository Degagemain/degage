import { CarPriceEstimate } from '@/domain/car-price-estimate.model';
import { getPrismaClient } from '@/storage/utils';
import { dbCarPriceEstimateToDomainWithRelations } from './car-price-estimate.mappers';

export const dbCarPriceEstimateRead = async (id: string): Promise<CarPriceEstimate> => {
  const prisma = getPrismaClient();
  const cpe = await prisma.carPriceEstimate.findUniqueOrThrow({
    where: { id },
    include: {
      carType: {
        include: {
          brand: { include: { translations: true } },
          fuelType: { include: { translations: true } },
        },
      },
    },
  });
  return dbCarPriceEstimateToDomainWithRelations(cpe);
};
