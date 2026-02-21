import * as z from 'zod';

export const fuelTypeTranslationSchema = z.object({
  locale: z.string().min(2).max(5),
  name: z.string().min(1).max(100),
});

export type FuelTypeTranslation = z.infer<typeof fuelTypeTranslationSchema>;

export const fuelTypeSchema = z
  .object({
    id: z.uuid().nullable(),
    code: z.string().min(1).max(50),
    name: z.string().min(1).max(100),
    isActive: z.boolean().default(true),
    pricePer: z.number().min(0).default(0),
    co2Contribution: z.number().int().min(0).default(0),
    translations: z.array(fuelTypeTranslationSchema).default([]),
    createdAt: z.date().nullable().default(null),
    updatedAt: z.date().nullable().default(null),
  })
  .strict();

export type FuelType = z.infer<typeof fuelTypeSchema>;

export function isElectricFuelType(fuelType: FuelType): boolean {
  return fuelType.code === 'electric';
}
