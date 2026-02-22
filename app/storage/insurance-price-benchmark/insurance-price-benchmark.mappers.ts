import { InsurancePriceBenchmark } from '@/domain/insurance-price-benchmark.model';
import { Prisma } from '@/storage/client/client';

type InsurancePriceBenchmarkDb = Prisma.InsurancePriceBenchmarkGetPayload<object>;

export const dbInsurancePriceBenchmarkToDomain = (db: InsurancePriceBenchmarkDb): InsurancePriceBenchmark => {
  return {
    id: db.id,
    year: db.year,
    maxCarPrice: db.maxCarPrice,
    baseRate: Number(db.baseRate),
    rate: Number(db.rate),
    createdAt: db.createdAt,
    updatedAt: db.updatedAt,
  };
};

export const insurancePriceBenchmarkToDbCreate = (b: InsurancePriceBenchmark): Prisma.InsurancePriceBenchmarkCreateInput => {
  return {
    year: b.year,
    maxCarPrice: b.maxCarPrice,
    baseRate: b.baseRate,
    rate: b.rate,
  };
};

export const insurancePriceBenchmarkToDbUpdate = (b: InsurancePriceBenchmark): Prisma.InsurancePriceBenchmarkUpdateInput => {
  return {
    year: b.year,
    maxCarPrice: b.maxCarPrice,
    baseRate: b.baseRate,
    rate: b.rate,
  };
};
