import { EuroNormFilter } from '@/domain/euro-norm.filter';

export const euroNormFilter = (data: Partial<EuroNormFilter> = {}): EuroNormFilter => {
  return {
    query: data.query ?? null,
    isActive: data.isActive ?? null,
    skip: data.skip ?? 0,
    take: data.take ?? 24,
    sortBy: data.sortBy ?? 'start',
    sortOrder: data.sortOrder ?? 'asc',
  };
};
