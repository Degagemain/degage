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
    euroNorm: idNameSchema.nullable().default(null),
    consumption: z.number(),
    createdAt: z.coerce.date().nullable().default(null),
    updatedAt: z.coerce.date().nullable().default(null),
  })
  .strict();

export type CarInfo = z.infer<typeof carInfoSchema>;
