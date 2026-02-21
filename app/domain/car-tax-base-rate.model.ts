import * as z from 'zod';
import { idNameSchema } from '@/domain/id-name.model';

export const carTaxBaseRateSchema = z
  .object({
    id: z.uuid().nullable(),
    fiscalRegion: idNameSchema,
    maxCc: z.number().int().min(0),
    fiscalPk: z.number().int().min(0),
    start: z.date().nullable().default(null),
    end: z.date().nullable().default(null),
    rate: z.number().min(0),
    createdAt: z.date().nullable().default(null),
    updatedAt: z.date().nullable().default(null),
  })
  .strict();

export type CarTaxBaseRate = z.infer<typeof carTaxBaseRateSchema>;
