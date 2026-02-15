import * as z from 'zod';

import { idNameSchema } from '@/domain/id-name.model';

export type TownProvince = z.infer<typeof idNameSchema>;
export type TownSimulationRegion = z.infer<typeof idNameSchema>;

export const townSchema = z
  .object({
    id: z.uuid().nullable(),
    zip: z.string().min(1).max(20),
    name: z.string().min(1).max(200),
    municipality: z.string().min(1).max(200),
    province: idNameSchema,
    simulationRegion: idNameSchema,
    highDemand: z.boolean().default(false),
    hasActiveMembers: z.boolean().default(false),
    createdAt: z.date().nullable().default(null),
    updatedAt: z.date().nullable().default(null),
  })
  .strict();

export type Town = z.infer<typeof townSchema>;
