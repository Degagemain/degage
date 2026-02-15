import * as z from 'zod';

import { idNameSchema } from '@/domain/id-name.model';

export type CarTypeBrand = z.infer<typeof idNameSchema>;
export type CarTypeFuelType = z.infer<typeof idNameSchema>;

export const carTypeSchema = z
  .object({
    id: z.uuid().nullable(),
    brand: idNameSchema,
    fuelType: idNameSchema,
    name: z.string().min(1).max(200),
    ecoscore: z.number().int().min(0).max(100),
    isActive: z.boolean().default(true),
    createdAt: z.date().nullable().default(null),
    updatedAt: z.date().nullable().default(null),
  })
  .strict();

export type CarType = z.infer<typeof carTypeSchema>;
