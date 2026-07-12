import { dbCarStickerDelete } from '@/storage/car-sticker/car-sticker.delete';
import { dbCarStickerLinkCount } from '@/storage/car-sticker/car-sticker.link-count';
import { dbCarStickerRead } from '@/storage/car-sticker/car-sticker.read';
import { dbDocumentDelete } from '@/storage/document/document.delete';
import { CarStickerInUseError } from '@/actions/car-sticker/car-sticker-in-use.error';

export const deleteCarSticker = async (id: string): Promise<void> => {
  const sticker = await dbCarStickerRead(id);
  const linkCount = await dbCarStickerLinkCount(id);

  if (linkCount > 0) {
    throw new CarStickerInUseError();
  }

  const documentId = sticker.image?.id ?? null;

  if (documentId != null) {
    await dbDocumentDelete(documentId);
  }

  await dbCarStickerDelete(id);
};
