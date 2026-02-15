import { Province } from '@/domain/province.model';
import { Prisma } from '@/storage/client/client';

export const dbProvinceToDomain = (province: Prisma.ProvinceGetPayload<object>): Province => {
  return {
    id: province.id,
    name: province.name,
    createdAt: province.createdAt,
    updatedAt: province.updatedAt,
  };
};

export const provinceToDbCreate = (province: Province): Prisma.ProvinceCreateInput => {
  return {
    name: province.name,
  };
};

export const provinceToDbUpdate = (province: Province): Prisma.ProvinceUpdateInput => {
  return {
    name: province.name,
  };
};
