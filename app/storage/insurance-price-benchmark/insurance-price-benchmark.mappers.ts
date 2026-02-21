import { InsurancePriceBenchmark } from '@/domain/insurance-price-benchmark.model';
import { Prisma } from '@/storage/client/client';

type InsurancePriceBenchmarkDb = Prisma.InsurancePriceBenchmarkGetPayload<object>;

export const dbInsurancePriceBenchmarkToDomain = (db: InsurancePriceBenchmarkDb): InsurancePriceBenchmark => {
  return {
    id: db.id,
    year: db.year,
    maxMileageExclusive: db.maxMileageExclusive,
    kmPrice: Number(db.kmPrice),
    createdAt: db.createdAt,
    updatedAt: db.updatedAt,
  };
};

export const insurancePriceBenchmarkToDbCreate = (b: InsurancePriceBenchmark): Prisma.InsurancePriceBenchmarkCreateInput => {
  return {
    year: b.year,
    maxMileageExclusive: b.maxMileageExclusive,
    kmPrice: b.kmPrice,
  };
};

export const insurancePriceBenchmarkToDbUpdate = (b: InsurancePriceBenchmark): Prisma.InsurancePriceBenchmarkUpdateInput => {
  return {
    year: b.year,
    maxMileageExclusive: b.maxMileageExclusive,
    kmPrice: b.kmPrice,
  };
};
