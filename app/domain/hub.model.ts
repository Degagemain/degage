import * as z from 'zod';

export const hubSchema = z
  .object({
    id: z.uuid().nullable(),
    name: z.string().min(1).max(100),
    isDefault: z.boolean().default(false),
    simMaxAge: z.number().int().min(0).default(15),
    simMaxKm: z.number().int().min(0).default(200_000),
    simMinEuroNormGroupDiesel: z.number().int().min(0).default(5),
    simMinEcoScoreForBonus: z.number().int().min(0).default(65),
    simMaxKmForBonus: z.number().int().min(0).default(140_000),
    simMaxAgeForBonus: z.number().int().min(0).default(7),
    simDepreciationKm: z.number().int().min(0).default(250_000),
    simDepreciationKmElectric: z.number().int().min(0).default(320_000),
    simInspectionCostPerYear: z.number().min(0).default(43),
    simMaintenanceCostPerYear: z.number().min(0).default(950),
    createdAt: z.date().nullable().default(null),
    updatedAt: z.date().nullable().default(null),
  })
  .strict();

export type Hub = z.infer<typeof hubSchema>;
