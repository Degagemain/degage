import { FuelTypeFilter } from '@/domain/fuel-type.filter';

export const fuelTypeFilter = (data: Partial<FuelTypeFilter> = {}): FuelTypeFilter => {
  return {
    query: data.query ?? null,
    isActive: data.isActive ?? null,
    skip: data.skip ?? 0,
    take: data.take ?? 24,
    sortBy: data.sortBy ?? 'code',
    sortOrder: data.sortOrder ?? 'asc',
  };
};
