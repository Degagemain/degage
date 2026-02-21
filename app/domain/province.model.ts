import * as z from 'zod';
import { idNameSchema } from '@/domain/id-name.model';

export const provinceSchema = z
  .object({
    id: z.uuid().nullable(),
    name: z.string().min(1).max(100),
    fiscalRegion: idNameSchema,
    createdAt: z.date().nullable().default(null),
    updatedAt: z.date().nullable().default(null),
  })
  .strict();

export type Province = z.infer<typeof provinceSchema>;
