import { Insurer } from '@/domain/insurer.model';
import { getPrismaClient } from '@/storage/utils';
import { dbInsurerToDomain, insurerToDbUpdate } from './insurer.mappers';

export const dbInsurerUpdate = async (insurer: Insurer): Promise<Insurer> => {
  const prisma = getPrismaClient();
  const updated = await prisma.insurer.update({
    where: { id: insurer.id! },
    data: insurerToDbUpdate(insurer),
  });
  return dbInsurerToDomain(updated);
};
