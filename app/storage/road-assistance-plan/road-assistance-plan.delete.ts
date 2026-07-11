import { getPrismaClient } from '@/storage/utils';

export const dbRoadAssistancePlanDelete = async (id: string): Promise<void> => {
  const prisma = getPrismaClient();
  await prisma.roadAssistancePlan.delete({
    where: { id },
  });
};
