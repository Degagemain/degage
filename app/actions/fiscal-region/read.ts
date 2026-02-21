import { FiscalRegion } from '@/domain/fiscal-region.model';
import { dbFiscalRegionRead } from '@/storage/fiscal-region/fiscal-region.read';

export const readFiscalRegion = async (id: string): Promise<FiscalRegion> => {
  return dbFiscalRegionRead(id);
};
