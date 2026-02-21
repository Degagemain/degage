import { FuelType } from '@/domain/fuel-type.model';

export const fuelType = (data: Partial<FuelType> = {}): FuelType => {
  return {
    id: data.id || '550e8400-e29b-41d4-a716-446655440000',
    code: data.code || 'electric',
    name: data.name || 'Electric',
    isActive: data.isActive ?? true,
    pricePer: data.pricePer ?? 0,
    co2Contribution: data.co2Contribution ?? 0,
    translations: data.translations || [
      { locale: 'en', name: 'Electric' },
      { locale: 'nl', name: 'Elektrisch' },
      { locale: 'fr', name: 'Électrique' },
    ],
    createdAt: data.createdAt || new Date(),
    updatedAt: data.updatedAt || new Date(),
  };
};
