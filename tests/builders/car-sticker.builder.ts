import { CarSticker } from '@/domain/car-sticker.model';

export const carSticker = (data: Partial<CarSticker> = {}): CarSticker => {
  return {
    id: data.id ?? '550e8400-e29b-41d4-a716-446655440000',
    name: data.name ?? 'Classic Dégage',
    isActive: data.isActive ?? true,
    isAlwaysIncluded: data.isAlwaysIncluded ?? false,
    image: data.image ?? null,
    createdAt: data.createdAt ?? new Date(),
    updatedAt: data.updatedAt ?? new Date(),
  };
};
