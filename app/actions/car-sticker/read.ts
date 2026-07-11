import { dbCarStickerRead } from '@/storage/car-sticker/car-sticker.read';

export const readCarSticker = async (id: string) => {
  return dbCarStickerRead(id);
};
