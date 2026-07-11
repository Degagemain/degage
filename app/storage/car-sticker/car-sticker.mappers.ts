import { CarSticker } from '@/domain/car-sticker.model';
import { Prisma } from '@/storage/client/client';

export const carStickerImageInclude = {
  image: true,
} as const satisfies Prisma.CarStickerInclude;

type CarStickerWithImage = Prisma.CarStickerGetPayload<{
  include: typeof carStickerImageInclude;
}>;

export const dbCarStickerToDomain = (sticker: CarStickerWithImage): CarSticker => {
  return {
    id: sticker.id,
    name: sticker.name,
    isActive: sticker.isActive,
    isAlwaysIncluded: sticker.isAlwaysIncluded,
    image: sticker.image
      ? {
          id: sticker.imageId!,
          name: sticker.image.fileName,
        }
      : null,
    createdAt: sticker.createdAt,
    updatedAt: sticker.updatedAt,
  };
};

export const carStickerToDbCreate = (sticker: CarSticker): Prisma.CarStickerCreateInput => {
  return {
    name: sticker.name,
    isActive: sticker.isActive,
    isAlwaysIncluded: sticker.isAlwaysIncluded,
  };
};

export const carStickerToDbUpdate = (sticker: CarSticker): Prisma.CarStickerUpdateInput => {
  const data: Prisma.CarStickerUpdateInput = {
    name: sticker.name,
    isActive: sticker.isActive,
    isAlwaysIncluded: sticker.isAlwaysIncluded,
  };

  if (sticker.image?.id) {
    data.image = { connect: { id: sticker.image.id } };
  }

  return data;
};
