import { HubBenchmark } from '@/domain/hub-benchmark.model';
import { Prisma } from '@/storage/client/client';

type HubBenchmarkDb = Prisma.HubBenchmarkGetPayload<object>;

type HubBenchmarkWithHub = Prisma.HubBenchmarkGetPayload<{ include: { hub: true } }>;

export const dbHubBenchmarkToDomain = (db: HubBenchmarkDb | HubBenchmarkWithHub): HubBenchmark => {
  const hub = 'hub' in db && db.hub != null ? { id: db.hub.id, name: db.hub.name } : { id: db.hubId };

  return {
    id: db.id,
    hub,
    ownerKm: db.ownerKm,
    sharedMinKm: db.sharedMinKm,
    sharedMaxKm: db.sharedMaxKm,
    sharedAvgKm: db.sharedAvgKm,
    createdAt: db.createdAt,
    updatedAt: db.updatedAt,
  };
};

export const hubBenchmarkToDbCreate = (hb: HubBenchmark): Prisma.HubBenchmarkCreateInput => {
  return {
    hub: { connect: { id: hb.hub.id } },
    ownerKm: hb.ownerKm,
    sharedMinKm: hb.sharedMinKm,
    sharedMaxKm: hb.sharedMaxKm,
    sharedAvgKm: hb.sharedAvgKm,
  };
};

export const hubBenchmarkToDbUpdate = (hb: HubBenchmark): Prisma.HubBenchmarkUpdateInput => {
  return {
    hub: { connect: { id: hb.hub.id } },
    ownerKm: hb.ownerKm,
    sharedMinKm: hb.sharedMinKm,
    sharedMaxKm: hb.sharedMaxKm,
    sharedAvgKm: hb.sharedAvgKm,
  };
};
