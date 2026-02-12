import { EuroNorm } from '@/domain/euro-norm.model';
import { getPrismaClient } from '@/storage/utils';
import { dbEuroNormToDomain, euroNormToDbUpdate } from './euro-norm.mappers';

export const dbEuroNormUpdate = async (euroNorm: EuroNorm): Promise<EuroNorm> => {
  const prisma = getPrismaClient();
  const updated = await prisma.euroNorm.update({
    where: { id: euroNorm.id! },
    data: euroNormToDbUpdate(euroNorm),
  });
  return dbEuroNormToDomain(updated);
};
