import * as z from 'zod';
import { Town, townSchema } from '@/domain/town.model';
import { dbTownUpdate } from '@/storage/town/town.update';

export const updateTown = async (town: Town): Promise<Town> => {
  const validated = townSchema.parse(town);
  z.uuid().parse(validated.id);
  return dbTownUpdate(validated);
};
