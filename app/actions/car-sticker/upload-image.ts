import { DocumentType, assertCarStickerImageUpload } from '@/domain/document.model';
import { createDocumentWithUpload } from '@/actions/document/create-with-upload';
import { updateDocumentWithUpload } from '@/actions/document/update-with-upload';
import { readCarSticker } from '@/actions/car-sticker/read';
import { updateCarSticker } from '@/actions/car-sticker/update';

export type CarStickerImageUploadFile = {
  fileName: string;
  contentType: string;
  sizeBytes: number;
  body: Buffer;
};

export const uploadCarStickerImage = async (id: string, file: CarStickerImageUploadFile): Promise<void> => {
  const existing = await readCarSticker(id);
  assertCarStickerImageUpload(file.contentType, file.sizeBytes);

  const linkedDocument = existing.image;

  if (linkedDocument?.id) {
    await updateDocumentWithUpload({
      documentId: linkedDocument.id,
      fileName: file.fileName,
      contentType: file.contentType,
      sizeBytes: file.sizeBytes,
      body: file.body,
    });
    return;
  }

  const created = await createDocumentWithUpload({
    type: DocumentType.CAR_STICKER,
    fileName: file.fileName,
    contentType: file.contentType,
    sizeBytes: file.sizeBytes,
    body: file.body,
  });

  await updateCarSticker({
    ...existing,
    image: { id: created.id! },
  });
};
