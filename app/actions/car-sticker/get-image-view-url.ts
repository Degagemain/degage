import { dbDocumentGetSignedViewUrl } from '@/storage/document/document.signed-view-url';
import { readCarSticker } from '@/actions/car-sticker/read';
import { CarStickerImageNotFoundError } from '@/actions/car-sticker/car-sticker-image-not-found.error';

export const getCarStickerImageViewUrl = async (id: string): Promise<string> => {
  const sticker = await readCarSticker(id);
  const documentId = sticker.image?.id ?? null;
  if (documentId == null) {
    throw new CarStickerImageNotFoundError();
  }
  return dbDocumentGetSignedViewUrl(documentId);
};
