import { getPrismaClient } from '@/storage/utils';

export const dbCarStickerDelete = async (id: string): Promise<void> => {
  const prisma = getPrismaClient();
  await prisma.carSticker.delete({
    where: { id },
  });
};
