import { EuroNorm } from '@/domain/euro-norm.model';
import { getPrismaClient } from '@/storage/utils';
import { dbEuroNormToDomain, euroNormToDbCreate } from './euro-norm.mappers';

export const dbEuroNormCreate = async (euroNorm: EuroNorm): Promise<EuroNorm> => {
  const prisma = getPrismaClient();
  const created = await prisma.euroNorm.create({
    data: euroNormToDbCreate(euroNorm),
  });
  return dbEuroNormToDomain(created);
};
