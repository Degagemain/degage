import { Insurer } from '@/domain/insurer.model';
import { getPrismaClient } from '@/storage/utils';
import { dbInsurerToDomain, insurerToDbCreate } from './insurer.mappers';

export const dbInsurerCreate = async (insurer: Insurer): Promise<Insurer> => {
  const prisma = getPrismaClient();
  const created = await prisma.insurer.create({
    data: insurerToDbCreate(insurer),
  });
  return dbInsurerToDomain(created);
};
