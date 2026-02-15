import * as z from 'zod';

/** Schema for relation display: id plus optional name (e.g. brand, fuelType, carType in list/detail views). */
export const idNameSchema = z.object({
  id: z.uuid(),
  name: z.string().optional(),
});

export type IdName = z.infer<typeof idNameSchema>;
