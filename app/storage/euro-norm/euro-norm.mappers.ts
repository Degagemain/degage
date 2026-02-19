import { EuroNorm } from '@/domain/euro-norm.model';
import { Prisma } from '@/storage/client/client';

export const dbEuroNormToDomain = (euroNorm: Prisma.EuroNormGetPayload<object>): EuroNorm => {
  return {
    id: euroNorm.id,
    code: euroNorm.code,
    name: euroNorm.name,
    group: euroNorm.group,
    isActive: euroNorm.isActive,
    start: euroNorm.start,
    end: euroNorm.end,
    createdAt: euroNorm.createdAt,
    updatedAt: euroNorm.updatedAt,
  };
};

export const euroNormToDbCreate = (euroNorm: EuroNorm): Prisma.EuroNormCreateInput => {
  return {
    code: euroNorm.code.toLowerCase().replace(/\s+/g, '-'),
    name: euroNorm.name,
    group: euroNorm.group,
    isActive: euroNorm.isActive,
    start: euroNorm.start,
    end: euroNorm.end ?? undefined,
  };
};

export const euroNormToDbUpdate = (euroNorm: EuroNorm): Prisma.EuroNormUpdateInput => {
  return {
    code: euroNorm.code.toLowerCase().replace(/\s+/g, '-'),
    name: euroNorm.name,
    group: euroNorm.group,
    isActive: euroNorm.isActive,
    start: euroNorm.start,
    end: euroNorm.end ?? undefined,
  };
};
