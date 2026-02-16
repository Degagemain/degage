import { Hub } from '@/domain/hub.model';
import { dbHubRead } from '@/storage/hub/hub.read';

export const readHub = async (id: string): Promise<Hub> => {
  return dbHubRead(id);
};
