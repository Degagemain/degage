import { CarSticker } from '@/domain/car-sticker.model';
import { getPrismaClient } from '@/storage/utils';
import { carStickerImageInclude, dbCarStickerToDomain } from './car-sticker.mappers';

export const dbCarStickerRead = async (id: string): Promise<CarSticker> => {
  const prisma = getPrismaClient();
  const sticker = await prisma.carSticker.findUniqueOrThrow({
    where: { id },
    include: carStickerImageInclude,
  });
  return dbCarStickerToDomain(sticker);
};
