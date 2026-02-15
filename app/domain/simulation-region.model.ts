import * as z from 'zod';

export const simulationRegionSchema = z
  .object({
    id: z.uuid().nullable(),
    name: z.string().min(1).max(100),
    isDefault: z.boolean().default(false),
    createdAt: z.date().nullable().default(null),
    updatedAt: z.date().nullable().default(null),
  })
  .strict();

export type SimulationRegion = z.infer<typeof simulationRegionSchema>;
