import * as z from 'zod';

export const carTypeBrandSchema = z.object({
  id: z.string().uuid(),
  name: z.string().optional(),
});

export const carTypeFuelTypeSchema = z.object({
  id: z.string().uuid(),
  name: z.string().optional(),
});

export type CarTypeBrand = z.infer<typeof carTypeBrandSchema>;
export type CarTypeFuelType = z.infer<typeof carTypeFuelTypeSchema>;

export const carTypeSchema = z
  .object({
    id: z.uuid().nullable(),
    brand: carTypeBrandSchema,
    fuelType: carTypeFuelTypeSchema,
    name: z.string().min(1).max(200),
    ecoscore: z.number().int().min(0).max(100),
    isActive: z.boolean().default(true),
    createdAt: z.date().nullable().default(null),
    updatedAt: z.date().nullable().default(null),
  })
  .strict();

export type CarType = z.infer<typeof carTypeSchema>;
