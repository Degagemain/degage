import { dbHubDelete } from '@/storage/hub/hub.delete';

export const deleteHub = async (id: string): Promise<void> => {
  await dbHubDelete(id);
};
