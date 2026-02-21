import { FiscalRegion } from '@/domain/fiscal-region.model';
import { getPrismaClient } from '@/storage/utils';
import { getRequestContentLocale } from '@/context/request-context';
import { dbFiscalRegionToDomain, fiscalRegionToDbCreate } from './fiscal-region.mappers';

export const dbFiscalRegionCreate = async (fiscalRegion: FiscalRegion): Promise<FiscalRegion> => {
  const prisma = getPrismaClient();
  const created = await prisma.fiscalRegion.create({
    data: fiscalRegionToDbCreate(fiscalRegion),
    include: { translations: true },
  });
  return dbFiscalRegionToDomain(created, getRequestContentLocale());
};
