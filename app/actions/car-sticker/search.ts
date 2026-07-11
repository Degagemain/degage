import { CarStickerFilter } from '@/domain/car-sticker.filter';
import { dbCarStickerSearch } from '@/storage/car-sticker/car-sticker.search';

export const searchCarStickers = async (filter: CarStickerFilter) => {
  return dbCarStickerSearch(filter);
};
