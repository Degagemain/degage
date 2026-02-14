import { getPrismaClient } from '@/storage/utils';

export const dbSimulationDelete = async (id: string): Promise<void> => {
  const prisma = getPrismaClient();
  await prisma.simulation.delete({
    where: { id },
  });
};
