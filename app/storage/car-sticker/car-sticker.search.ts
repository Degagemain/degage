import { CarSticker } from '@/domain/car-sticker.model';
import { CarStickerFilter } from '@/domain/car-sticker.filter';
import { getPrismaClient } from '@/storage/utils';
import { Page } from '@/domain/page.model';
import { Prisma } from '@/storage/client/client';
import { carStickerImageInclude, dbCarStickerToDomain } from './car-sticker.mappers';

export const filterToQuery = (filter: CarStickerFilter): Prisma.CarStickerWhereInput => {
  const q = filter.query?.trim();
  return {
    name: q ? { contains: q, mode: 'insensitive' } : undefined,
  };
};

export const dbCarStickerSearch = async (filter: CarStickerFilter): Promise<Page<CarSticker>> => {
  const prisma = getPrismaClient();
  const whereClause = filterToQuery(filter);
  const total = await prisma.carSticker.count({
    where: whereClause,
  });
  const stickers = await prisma.carSticker.findMany({
    where: whereClause,
    skip: filter.skip,
    take: filter.take,
    orderBy: filter.sortBy ? { [filter.sortBy]: filter.sortOrder } : undefined,
    include: carStickerImageInclude,
  });
  return {
    records: stickers.map(dbCarStickerToDomain),
    total,
  };
};
