import { FiscalRegion, fiscalRegionSchema } from '@/domain/fiscal-region.model';
import { dbFiscalRegionCreate } from '@/storage/fiscal-region/fiscal-region.create';

export const createFiscalRegion = async (fiscalRegion: FiscalRegion): Promise<FiscalRegion> => {
  const validated = fiscalRegionSchema.parse(fiscalRegion);
  return dbFiscalRegionCreate(validated);
};
