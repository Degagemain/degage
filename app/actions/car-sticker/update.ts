import { CarSticker, carStickerSchema } from '@/domain/car-sticker.model';
import { dbCarStickerUpdate } from '@/storage/car-sticker/car-sticker.update';

export const updateCarSticker = async (sticker: CarSticker): Promise<CarSticker> => {
  const validated = carStickerSchema.parse(sticker);
  return dbCarStickerUpdate(validated);
};
