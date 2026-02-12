import { CarType } from '@/domain/car-type.model';

export const carType = (data: Partial<CarType> = {}): CarType => {
  return {
    id: data.id ?? null,
    brand: data.brand ?? { id: '550e8400-e29b-41d4-a716-446655440001', name: 'Tesla' },
    fuelType: data.fuelType ?? { id: '550e8400-e29b-41d4-a716-446655440002', name: 'Electric' },
    name: data.name ?? 'Model 3',
    ecoscore: data.ecoscore ?? 75,
    isActive: data.isActive ?? true,
    createdAt: data.createdAt ?? new Date(),
    updatedAt: data.updatedAt ?? new Date(),
  };
};
