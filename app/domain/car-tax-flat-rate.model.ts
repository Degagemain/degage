import * as z from 'zod';
import { idNameSchema } from '@/domain/id-name.model';

export const carTaxFlatRateSchema = z
  .object({
    id: z.uuid().nullable(),
    fiscalRegion: idNameSchema,
    start: z.date().nullable().default(null),
    rate: z.number().min(0),
    createdAt: z.date().nullable().default(null),
    updatedAt: z.date().nullable().default(null),
  })
  .strict();

export type CarTaxFlatRate = z.infer<typeof carTaxFlatRateSchema>;
