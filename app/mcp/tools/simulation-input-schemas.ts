import * as z from 'zod';

const idNameMcpSchema = z.object({
  id: z.uuid().describe('UUID of the entity.'),
  name: z.string().optional().describe('Display name (optional but recommended for readability).'),
});

export const simulationCreateMcpInputSchema = {
  town: idNameMcpSchema.describe('Town where the car will be used. Resolve via search_towns.'),
  brand: idNameMcpSchema.describe('Car brand. Resolve via search_car_brands.'),
  fuelType: idNameMcpSchema.describe('Fuel type. Resolve via search_fuel_types.'),
  carType: idNameMcpSchema
    .nullable()
    .optional()
    .describe('Car type. Resolve via search_car_types after brand and fuel type are known. Omit or null when using carTypeOther.'),
  carTypeOther: z
    .string()
    .nullable()
    .optional()
    .describe('Custom car type description when no matching car type exists. Required when carType is null.'),
  mileage: z.number().int().min(0).describe('Current odometer reading in km. Use 0 for brand-new purchased cars (isNewCar=true).'),
  ownerKmPerYear: z.number().int().min(0).describe('Expected km the owner will drive per year.'),
  seats: z.number().int().min(1).describe('Number of seats (typically 2–9).'),
  firstRegisteredAt: z.string().describe('First registration date as ISO date (YYYY-MM-DD). Use today for brand-new purchased cars.'),
  isVan: z.boolean().optional().describe('Whether the car is a van. Default false.'),
  isPurchased: z
    .boolean()
    .optional()
    .describe('True when simulating a car being purchased; false when the user already owns the car. Default false.'),
  isNewCar: z.boolean().optional().describe('True only when isPurchased=true and the car is brand new. Requires isPurchased. Default false.'),
  purchasePrice: z
    .number()
    .min(0)
    .nullable()
    .optional()
    .describe('Purchase price incl. VAT. Required when isPurchased=true; omit or null for existing cars.'),
};
