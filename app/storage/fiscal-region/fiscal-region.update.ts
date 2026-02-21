import { FiscalRegion } from '@/domain/fiscal-region.model';
import { getPrismaClient } from '@/storage/utils';
import { getRequestContentLocale } from '@/context/request-context';
import { dbFiscalRegionToDomain, fiscalRegionToDbUpdate } from './fiscal-region.mappers';

export const dbFiscalRegionUpdate = async (fiscalRegion: FiscalRegion): Promise<FiscalRegion> => {
  const prisma = getPrismaClient();
  const updated = await prisma.fiscalRegion.update({
    where: { id: fiscalRegion.id! },
    data: fiscalRegionToDbUpdate(fiscalRegion),
    include: { translations: true },
  });
  return dbFiscalRegionToDomain(updated, getRequestContentLocale());
};
