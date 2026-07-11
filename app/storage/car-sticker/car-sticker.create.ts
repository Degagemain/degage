import { CarSticker } from '@/domain/car-sticker.model';
import { getPrismaClient } from '@/storage/utils';
import { carStickerImageInclude, carStickerToDbCreate, dbCarStickerToDomain } from './car-sticker.mappers';

export const dbCarStickerCreate = async (sticker: CarSticker): Promise<CarSticker> => {
  const prisma = getPrismaClient();
  const created = await prisma.carSticker.create({
    data: carStickerToDbCreate(sticker),
    include: carStickerImageInclude,
  });
  return dbCarStickerToDomain(created);
};
