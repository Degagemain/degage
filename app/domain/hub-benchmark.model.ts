import * as z from 'zod';

import { idNameSchema } from '@/domain/id-name.model';

export const hubBenchmarkSchema = z
  .object({
    id: z.uuid().nullable(),
    hubId: z.uuid(),
    ownerKm: z.number().int().min(0),
    sharedMinKm: z.number().int().min(0).default(0),
    sharedMaxKm: z.number().int().min(0).default(0),
    sharedAvgKm: z.number().int().min(0).default(0),
    createdAt: z.date().nullable().default(null),
    updatedAt: z.date().nullable().default(null),
    hub: idNameSchema.optional(),
  })
  .strict();

export type HubBenchmark = z.infer<typeof hubBenchmarkSchema>;
