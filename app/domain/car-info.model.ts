import * as z from 'zod';

import { idNameSchema } from '@/domain/id-name.model';

const carInfoCarTypeSchema = idNameSchema.extend({
  brand: idNameSchema.optional(),
  fuelType: idNameSchema.optional(),
});

export const carInfoSchema = z
  .object({
    id: z.uuid().nullable(),
    carType: carInfoCarTypeSchema,
    year: z.number().int(),
    cylinderCc: z.number().int(),
    co2Emission: z.number().int(),
    ecoscore: z.number().int().min(0).max(100),
    euroNormId: z.uuid().nullable().default(null),
    euroNorm: idNameSchema.optional(), // populated when loaded with relations (e.g. name = code)
    consumption: z.number(),
    createdAt: z.date().nullable().default(null),
    updatedAt: z.date().nullable().default(null),
  })
  .strict();

export type CarInfo = z.infer<typeof carInfoSchema>;
