import { EuroNorm } from '@/domain/euro-norm.model';

export const euroNorm = (data: Partial<EuroNorm> = {}): EuroNorm => {
  return {
    id: data.id || '550e8400-e29b-41d4-a716-446655440000',
    code: data.code || 'euro-6d',
    name: data.name || 'Euro 6d',
    isActive: data.isActive ?? true,
    start: data.start || new Date('2021-01-01'),
    end: data.end ?? null,
    createdAt: data.createdAt || new Date(),
    updatedAt: data.updatedAt || new Date(),
  };
};
