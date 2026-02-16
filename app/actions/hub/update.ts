import * as z from 'zod';
import { Hub, hubSchema } from '@/domain/hub.model';
import { dbHubUpdate } from '@/storage/hub/hub.update';
import { dbHubClearOtherDefaults } from '@/storage/hub/clear-other-defaults';

export const updateHub = async (hub: Hub): Promise<Hub> => {
  const validated = hubSchema.parse(hub);
  z.uuid().parse(validated.id);
  const updated = await dbHubUpdate(validated);
  if (updated.isDefault) {
    await dbHubClearOtherDefaults(updated.id!);
  }
  return updated;
};
