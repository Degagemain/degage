import { getPrismaClient } from '@/storage/utils';

export const dbSimulationRegionDelete = async (id: string): Promise<void> => {
  const prisma = getPrismaClient();
  await prisma.simulationRegion.delete({
    where: { id },
  });
};
