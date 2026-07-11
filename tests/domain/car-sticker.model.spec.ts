import { describe, expect, it } from 'vitest';
import { carStickerSchema } from '@/domain/car-sticker.model';

describe('car-sticker.model', () => {
  it('parses a valid car sticker', () => {
    const result = carStickerSchema.safeParse({
      id: '550e8400-e29b-41d4-a716-446655440000',
      name: 'Classic Dégage',
      isActive: true,
      isAlwaysIncluded: false,
      image: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    expect(result.success).toBe(true);
  });

  it('defaults isActive and isAlwaysIncluded', () => {
    const result = carStickerSchema.safeParse({
      id: null,
      name: 'Minimal',
      image: null,
      createdAt: null,
      updatedAt: null,
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.isActive).toBe(true);
      expect(result.data.isAlwaysIncluded).toBe(false);
    }
  });

  it('fails when name is empty', () => {
    const result = carStickerSchema.safeParse({
      id: null,
      name: '',
      isActive: true,
      isAlwaysIncluded: false,
      image: null,
      createdAt: null,
      updatedAt: null,
    });
    expect(result.success).toBe(false);
  });
});
