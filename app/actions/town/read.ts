import { Town } from '@/domain/town.model';
import { dbTownRead } from '@/storage/town/town.read';

export const readTown = async (id: string): Promise<Town> => {
  return dbTownRead(id);
};
