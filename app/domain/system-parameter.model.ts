import * as z from 'zod';

export enum SystemParameterCategory {
  SIMULATION = 'simulation',
}

export enum SystemParameterType {
  NUMBER = 'number',
  NUMBER_RANGE = 'number_range',
  EURONORM = 'euronorm',
}

export const systemParameterTranslationSchema = z.object({
  locale: z.string().min(2).max(5),
  name: z.string().min(1).max(200),
  description: z.string().max(2000).default(''),
});

export type SystemParameterTranslation = z.infer<typeof systemParameterTranslationSchema>;

export const systemParameterSchema = z
  .object({
    id: z.string().uuid().nullable(),
    code: z.string().min(1).max(100),
    category: z.nativeEnum(SystemParameterCategory),
    type: z.nativeEnum(SystemParameterType),
    name: z.string().min(1).max(200),
    description: z.string().max(2000).default(''),
    translations: z.array(systemParameterTranslationSchema).default([]),
    valueNumber: z.number().nullable().default(null),
    valueNumberMin: z.number().nullable().default(null),
    valueNumberMax: z.number().nullable().default(null),
    valueEuronormId: z.string().uuid().nullable().default(null),
    createdAt: z.date().nullable().default(null),
    updatedAt: z.date().nullable().default(null),
  })
  .strict();

export type SystemParameter = z.infer<typeof systemParameterSchema>;

/** Only value fields — used when admins update parameter values at runtime. */
export const systemParameterValueUpdateSchema = z
  .object({
    valueNumber: z.number().nullable().optional(),
    valueNumberMin: z.number().nullable().optional(),
    valueNumberMax: z.number().nullable().optional(),
    valueEuronormId: z.string().uuid().nullable().optional(),
  })
  .strict();

export type SystemParameterValueUpdate = z.infer<typeof systemParameterValueUpdateSchema>;
