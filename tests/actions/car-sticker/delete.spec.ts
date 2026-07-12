import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/storage/car-sticker/car-sticker.read', () => ({
  dbCarStickerRead: vi.fn(),
}));

vi.mock('@/storage/car-sticker/car-sticker.link-count', () => ({
  dbCarStickerLinkCount: vi.fn(),
}));

vi.mock('@/storage/car-sticker/car-sticker.delete', () => ({
  dbCarStickerDelete: vi.fn(),
}));

vi.mock('@/storage/document/document.delete', () => ({
  dbDocumentDelete: vi.fn(),
}));

import { deleteCarSticker } from '@/actions/car-sticker/delete';
import { CarStickerInUseError } from '@/actions/car-sticker/car-sticker-in-use.error';
import { dbCarStickerDelete } from '@/storage/car-sticker/car-sticker.delete';
import { dbCarStickerLinkCount } from '@/storage/car-sticker/car-sticker.link-count';
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
    vi.mocked(dbCarStickerLinkCount).mockResolvedValueOnce(0);

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
    vi.mocked(dbCarStickerLinkCount).mockResolvedValueOnce(0);
    vi.mocked(dbDocumentDelete).mockRejectedValueOnce(new Error('gcs failed'));

    await expect(deleteCarSticker(stickerId)).rejects.toThrow('gcs failed');
    expect(dbCarStickerDelete).not.toHaveBeenCalled();
  });

  it('deletes sticker directly when no image is linked', async () => {
    vi.mocked(dbCarStickerRead).mockResolvedValueOnce(carSticker({ id: stickerId }));
    vi.mocked(dbCarStickerLinkCount).mockResolvedValueOnce(0);

    await deleteCarSticker(stickerId);

    expect(dbDocumentDelete).not.toHaveBeenCalled();
    expect(dbCarStickerDelete).toHaveBeenCalledWith(stickerId);
  });

  it('throws when sticker is linked to a car onboarding', async () => {
    vi.mocked(dbCarStickerRead).mockResolvedValueOnce(carSticker({ id: stickerId }));
    vi.mocked(dbCarStickerLinkCount).mockResolvedValueOnce(1);

    await expect(deleteCarSticker(stickerId)).rejects.toThrow(CarStickerInUseError);
    expect(dbDocumentDelete).not.toHaveBeenCalled();
    expect(dbCarStickerDelete).not.toHaveBeenCalled();
  });
});
