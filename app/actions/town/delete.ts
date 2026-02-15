import { dbTownDelete } from '@/storage/town/town.delete';

export const deleteTown = async (id: string): Promise<void> => {
  await dbTownDelete(id);
};
