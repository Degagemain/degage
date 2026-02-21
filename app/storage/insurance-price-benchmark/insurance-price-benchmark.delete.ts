import { getPrismaClient } from '@/storage/utils';

export const dbInsurancePriceBenchmarkDelete = async (id: string): Promise<void> => {
  const prisma = getPrismaClient();
  await prisma.insurancePriceBenchmark.delete({
    where: { id },
  });
};
