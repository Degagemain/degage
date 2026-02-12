import { CarTypeFilter } from '@/domain/car-type.filter';

export const carTypeFilter = (data: Partial<CarTypeFilter> = {}): CarTypeFilter => {
  return {
    query: data.query ?? null,
    isActive: data.isActive ?? null,
    skip: data.skip ?? 0,
    take: data.take ?? 24,
    sortBy: data.sortBy ?? 'code',
    sortOrder: data.sortOrder ?? 'asc',
  };
};
