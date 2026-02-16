import { getPrismaClient } from '@/storage/utils';

/**
 * Sets isDefault to false for all Hub records except the one with the given id.
 * Used to enforce "only one default" when creating or updating a hub with isDefault true.
 */
export const dbHubClearOtherDefaults = async (excludeId: string): Promise<void> => {
  const prisma = getPrismaClient();
  await prisma.hub.updateMany({
    where: { id: { not: excludeId } },
    data: { isDefault: false },
  });
};
