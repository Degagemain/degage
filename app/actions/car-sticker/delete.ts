import { dbCarStickerDelete } from '@/storage/car-sticker/car-sticker.delete';
import { dbCarStickerRead } from '@/storage/car-sticker/car-sticker.read';
import { dbDocumentDelete } from '@/storage/document/document.delete';

export const deleteCarSticker = async (id: string): Promise<void> => {
  const sticker = await dbCarStickerRead(id);
  const documentId = sticker.image?.id ?? null;

  if (documentId != null) {
    await dbDocumentDelete(documentId);
  }

  await dbCarStickerDelete(id);
};
