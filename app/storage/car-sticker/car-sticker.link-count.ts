import { getPrismaClient } from '@/storage/utils';

export const dbCarStickerLinkCount = async (carStickerId: string): Promise<number> => {
  const prisma = getPrismaClient();
  return prisma.carOnboardingSticker.count({
    where: { carStickerId },
  });
};
