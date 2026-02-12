import { EuroNorm } from '@/domain/euro-norm.model';
import { getPrismaClient } from '@/storage/utils';
import { dbEuroNormToDomain } from './euro-norm.mappers';

export const dbEuroNormRead = async (id: string): Promise<EuroNorm> => {
  const prisma = getPrismaClient();
  const euroNorm = await prisma.euroNorm.findUniqueOrThrow({
    where: { id },
  });
  return dbEuroNormToDomain(euroNorm);
};
