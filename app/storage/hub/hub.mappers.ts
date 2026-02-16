import { Hub } from '@/domain/hub.model';
import { Prisma } from '@/storage/client/client';

export const dbHubToDomain = (hub: Prisma.HubGetPayload<object>): Hub => {
  return {
    id: hub.id,
    name: hub.name,
    isDefault: hub.isDefault,
    createdAt: hub.createdAt,
    updatedAt: hub.updatedAt,
  };
};

export const hubToDbCreate = (hub: Hub): Prisma.HubCreateInput => {
  return {
    name: hub.name,
    isDefault: hub.isDefault,
  };
};

export const hubToDbUpdate = (hub: Hub): Prisma.HubUpdateInput => {
  return {
    name: hub.name,
    isDefault: hub.isDefault,
  };
};
