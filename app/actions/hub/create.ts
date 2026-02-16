import { Hub, hubSchema } from '@/domain/hub.model';
import { dbHubCreate } from '@/storage/hub/hub.create';
import { dbHubClearOtherDefaults } from '@/storage/hub/clear-other-defaults';

export const createHub = async (hub: Hub): Promise<Hub> => {
  const validated = hubSchema.parse(hub);
  const created = await dbHubCreate(validated);
  if (created.isDefault) {
    await dbHubClearOtherDefaults(created.id!);
  }
  return created;
};
