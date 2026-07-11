import { CarSticker } from '@/domain/car-sticker.model';
import { getPrismaClient } from '@/storage/utils';
import { carStickerImageInclude, carStickerToDbUpdate, dbCarStickerToDomain } from './car-sticker.mappers';

export const dbCarStickerUpdate = async (sticker: CarSticker): Promise<CarSticker> => {
  const prisma = getPrismaClient();
  const updated = await prisma.carSticker.update({
    where: { id: sticker.id! },
    data: carStickerToDbUpdate(sticker),
    include: carStickerImageInclude,
  });
  return dbCarStickerToDomain(updated);
};
