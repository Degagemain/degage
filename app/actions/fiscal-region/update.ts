import * as z from 'zod';
import { FiscalRegion, fiscalRegionSchema } from '@/domain/fiscal-region.model';
import { dbFiscalRegionUpdate } from '@/storage/fiscal-region/fiscal-region.update';

export const updateFiscalRegion = async (fiscalRegion: FiscalRegion): Promise<FiscalRegion> => {
  const validated = fiscalRegionSchema.parse(fiscalRegion);
  z.uuid().parse(validated.id);
  return dbFiscalRegionUpdate(validated);
};
