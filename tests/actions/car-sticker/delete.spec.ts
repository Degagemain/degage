import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/storage/car-sticker/car-sticker.read', () => ({
  dbCarStickerRead: vi.fn(),
}));

vi.mock('@/storage/car-sticker/car-sticker.delete', () => ({
  dbCarStickerDelete: vi.fn(),
}));

vi.mock('@/storage/document/document.delete', () => ({
  dbDocumentDelete: vi.fn(),
}));

import { deleteCarSticker } from '@/actions/car-sticker/delete';
import { dbCarStickerDelete } from '@/storage/car-sticker/car-sticker.delete';
import { dbCarStickerRead } from '@/storage/car-sticker/car-sticker.read';
import { dbDocumentDelete } from '@/storage/document/document.delete';
import { carSticker } from '../../builders/car-sticker.builder';

const stickerId = '550e8400-e29b-41d4-a716-446655440000';

describe('deleteCarSticker', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('deletes linked image document before deleting sticker', async () => {
    vi.mocked(dbCarStickerRead).mockResolvedValueOnce(
      carSticker({
        id: stickerId,
        image: { id: 'image-doc', name: 'sticker.png' },
      }),
    );

    await deleteCarSticker(stickerId);

    expect(dbDocumentDelete).toHaveBeenCalledWith('image-doc');
    expect(dbCarStickerDelete).toHaveBeenCalledWith(stickerId);
    expect(dbDocumentDelete.mock.invocationCallOrder[0]).toBeLessThan(dbCarStickerDelete.mock.invocationCallOrder[0]);
  });

  it('does not delete sticker when document delete fails', async () => {
    vi.mocked(dbCarStickerRead).mockResolvedValueOnce(
      carSticker({
        id: stickerId,
        image: { id: 'image-doc', name: 'sticker.png' },
      }),
    );
    vi.mocked(dbDocumentDelete).mockRejectedValueOnce(new Error('gcs failed'));

    await expect(deleteCarSticker(stickerId)).rejects.toThrow('gcs failed');
    expect(dbCarStickerDelete).not.toHaveBeenCalled();
  });

  it('deletes sticker directly when no image is linked', async () => {
    vi.mocked(dbCarStickerRead).mockResolvedValueOnce(carSticker({ id: stickerId }));

    await deleteCarSticker(stickerId);

    expect(dbDocumentDelete).not.toHaveBeenCalled();
    expect(dbCarStickerDelete).toHaveBeenCalledWith(stickerId);
  });
});
