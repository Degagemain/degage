import { getPrismaClient } from '@/storage/utils';

export const dbHubBenchmarkDelete = async (id: string): Promise<void> => {
  const prisma = getPrismaClient();
  await prisma.hubBenchmark.delete({
    where: { id },
  });
};
