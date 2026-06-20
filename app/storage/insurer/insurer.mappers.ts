import { Insurer } from '@/domain/insurer.model';
import { Prisma } from '@/storage/client/client';

export const dbInsurerToDomain = (insurer: Prisma.InsurerGetPayload<object>): Insurer => {
  return {
    id: insurer.id,
    name: insurer.name,
    createdAt: insurer.createdAt,
    updatedAt: insurer.updatedAt,
  };
};

export const insurerToDbCreate = (insurer: Insurer): Prisma.InsurerCreateInput => {
  return {
    name: insurer.name,
  };
};

export const insurerToDbUpdate = (insurer: Insurer): Prisma.InsurerUpdateInput => {
  return {
    name: insurer.name,
  };
};
