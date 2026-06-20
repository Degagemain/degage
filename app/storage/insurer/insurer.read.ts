import { Insurer } from '@/domain/insurer.model';
import { getPrismaClient } from '@/storage/utils';
import { dbInsurerToDomain } from './insurer.mappers';

export const dbInsurerRead = async (id: string): Promise<Insurer> => {
  const prisma = getPrismaClient();
  const insurer = await prisma.insurer.findUniqueOrThrow({
    where: { id },
  });
  return dbInsurerToDomain(insurer);
};
