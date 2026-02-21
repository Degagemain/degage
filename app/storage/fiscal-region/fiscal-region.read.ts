import { FiscalRegion } from '@/domain/fiscal-region.model';
import { getPrismaClient } from '@/storage/utils';
import { getRequestContentLocale } from '@/context/request-context';
import { dbFiscalRegionToDomain } from './fiscal-region.mappers';

export const dbFiscalRegionRead = async (id: string): Promise<FiscalRegion> => {
  const prisma = getPrismaClient();
  const fiscalRegion = await prisma.fiscalRegion.findUniqueOrThrow({
    where: { id },
    include: { translations: true },
  });
  return dbFiscalRegionToDomain(fiscalRegion, getRequestContentLocale());
};
