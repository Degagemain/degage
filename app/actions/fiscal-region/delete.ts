import { dbFiscalRegionDelete } from '@/storage/fiscal-region/fiscal-region.delete';

export const deleteFiscalRegion = async (id: string): Promise<void> => {
  return dbFiscalRegionDelete(id);
};
