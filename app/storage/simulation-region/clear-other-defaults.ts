import { getPrismaClient } from '@/storage/utils';

/**
 * Sets isDefault to false for all SimulationRegion records except the one with the given id.
 * Used to enforce "only one default" when creating or updating a region with isDefault true.
 */
export const dbSimulationRegionClearOtherDefaults = async (excludeId: string): Promise<void> => {
  const prisma = getPrismaClient();
  await prisma.simulationRegion.updateMany({
    where: { id: { not: excludeId } },
    data: { isDefault: false },
  });
};
