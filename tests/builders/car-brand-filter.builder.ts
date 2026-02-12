import { CarBrandFilter } from '@/domain/car-brand.filter';

export const carBrandFilter = (data: Partial<CarBrandFilter> = {}): CarBrandFilter => {
  return {
    query: data.query ?? null,
    isActive: data.isActive ?? null,
    skip: data.skip ?? 0,
    take: data.take ?? 24,
    sortBy: data.sortBy ?? 'code',
    sortOrder: data.sortOrder ?? 'asc',
  };
};
