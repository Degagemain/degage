import * as z from 'zod';

import { idNameSchema } from '@/domain/id-name.model';

const carPriceEstimateCarTypeSchema = idNameSchema.extend({
  brand: idNameSchema.optional(),
});

export const carPriceEstimateSchema = z
  .object({
    id: z.uuid().nullable(),
    carType: carPriceEstimateCarTypeSchema,
    year: z.number().int(),
    price: z.number(),
    rangeMin: z.number(),
    rangeMax: z.number(),
    prompt: z.string().nullable().default(null),
    remarks: z.string().nullable().default(null),
    articleRefs: z.array(z.string()).default([]),
    createdAt: z.date().nullable().default(null),
    updatedAt: z.date().nullable().default(null),
  })
  .strict();

export type CarPriceEstimate = z.infer<typeof carPriceEstimateSchema>;
