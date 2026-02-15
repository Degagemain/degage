import { Town, townSchema } from '@/domain/town.model';
import { dbTownCreate } from '@/storage/town/town.create';

export const createTown = async (town: Town): Promise<Town> => {
  const validated = townSchema.parse(town);
  return dbTownCreate(validated);
};
