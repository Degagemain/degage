import { HubBenchmark } from '@/domain/hub-benchmark.model';
import { Prisma } from '@/storage/client/client';

type HubBenchmarkDb = Prisma.HubBenchmarkGetPayload<object>;

type HubBenchmarkWithHub = Prisma.HubBenchmarkGetPayload<{ include: { hub: true } }>;

export const dbHubBenchmarkToDomain = (db: HubBenchmarkDb): HubBenchmark => {
  return {
    id: db.id,
    hubId: db.hubId,
    ownerKm: db.ownerKm,
    sharedMinKm: db.sharedMinKm,
    sharedMaxKm: db.sharedMaxKm,
    sharedAvgKm: db.sharedAvgKm,
    createdAt: db.createdAt,
    updatedAt: db.updatedAt,
  };
};

export const dbHubBenchmarkToDomainWithRelations = (db: HubBenchmarkWithHub): HubBenchmark => {
  return {
    ...dbHubBenchmarkToDomain(db),
    hub: { id: db.hubId, name: db.hub.name },
  };
};

export const hubBenchmarkToDbCreate = (hb: HubBenchmark): Prisma.HubBenchmarkCreateInput => {
  return {
    hub: { connect: { id: hb.hubId } },
    ownerKm: hb.ownerKm,
    sharedMinKm: hb.sharedMinKm,
    sharedMaxKm: hb.sharedMaxKm,
    sharedAvgKm: hb.sharedAvgKm,
  };
};

export const hubBenchmarkToDbUpdate = (hb: HubBenchmark): Prisma.HubBenchmarkUpdateInput => {
  return {
    hub: { connect: { id: hb.hubId } },
    ownerKm: hb.ownerKm,
    sharedMinKm: hb.sharedMinKm,
    sharedMaxKm: hb.sharedMaxKm,
    sharedAvgKm: hb.sharedAvgKm,
  };
};
