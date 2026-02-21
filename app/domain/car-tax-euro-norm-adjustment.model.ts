import * as z from 'zod';
import { idNameSchema } from '@/domain/id-name.model';

export const carTaxEuroNormAdjustmentSchema = z
  .object({
    id: z.uuid().nullable(),
    fiscalRegion: idNameSchema,
    euroNormGroup: z.number().int().min(0),
    defaultAdjustment: z.number(),
    dieselAdjustment: z.number(),
    createdAt: z.date().nullable().default(null),
    updatedAt: z.date().nullable().default(null),
  })
  .strict();

export type CarTaxEuroNormAdjustment = z.infer<typeof carTaxEuroNormAdjustmentSchema>;
