import * as z from 'zod';

export const insurancePriceBenchmarkSchema = z
  .object({
    id: z.uuid().nullable(),
    year: z.number().int().min(2000).max(2100),
    maxCarPrice: z.number().int().min(0),
    baseRate: z.number().min(0),
    rate: z.number().min(0),
    createdAt: z.date().nullable().default(null),
    updatedAt: z.date().nullable().default(null),
  })
  .strict();

export type InsurancePriceBenchmark = z.infer<typeof insurancePriceBenchmarkSchema>;
