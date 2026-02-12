import { CarType } from '@/domain/car-type.model';

export const carType = (data: Partial<CarType> = {}): CarType => {
  return {
    id: data.id || '550e8400-e29b-41d4-a716-446655440000',
    code: data.code || 'audi',
    name: data.name || 'Audi',
    isActive: data.isActive ?? true,
    translations: data.translations || [
      { locale: 'en', name: 'Audi' },
      { locale: 'nl', name: 'Audi' },
      { locale: 'fr', name: 'Audi' },
    ],
    createdAt: data.createdAt || new Date(),
    updatedAt: data.updatedAt || new Date(),
  };
};
