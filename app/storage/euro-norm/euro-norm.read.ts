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

export const dbEuroNormFindByCode = async (code: string): Promise<EuroNorm | null> => {
  const prisma = getPrismaClient();
  const euroNorm = await prisma.euroNorm.findUnique({
    where: { code: code.toLowerCase().replace(/\s+/g, '-') },
  });
  return euroNorm ? dbEuroNormToDomain(euroNorm) : null;
};
