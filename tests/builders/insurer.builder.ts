import { Insurer } from '@/domain/insurer.model';

export const insurer = (data: Partial<Insurer> = {}): Insurer => {
  return {
    id: data.id || '550e8400-e29b-41d4-a716-446655440000',
    name: data.name || 'Ethias',
    createdAt: data.createdAt || new Date(),
    updatedAt: data.updatedAt || new Date(),
  };
};
