import { CarSticker, carStickerSchema } from '@/domain/car-sticker.model';
import { dbCarStickerCreate } from '@/storage/car-sticker/car-sticker.create';

export const createCarSticker = async (sticker: CarSticker): Promise<CarSticker> => {
  const validated = carStickerSchema.parse(sticker);
  return dbCarStickerCreate(validated);
};
