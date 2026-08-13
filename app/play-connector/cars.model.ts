import * as z from 'zod';

export const playCarFuelValues = ['ELECTRIC', 'DIESEL', 'PETROL', 'HYBRID', 'PLUGINHYBRID', 'LPG', 'CNG'] as const;
export const playCarFuelEnum = z.enum(playCarFuelValues);
export type PlayCarFuel = z.infer<typeof playCarFuelEnum>;

export const playCarPurchaseDateValues = ['STILLTOBEPURCHASED', 'LESSTHAN', 'OVERTHAN'] as const;
export const playCarPurchaseDateEnum = z.enum(playCarPurchaseDateValues);
export type PlayCarPurchaseDate = z.infer<typeof playCarPurchaseDateEnum>;

export const playCarVehicleTypeValues = ['PASSENGER_CAR', 'LIGHT_FREIGHT', 'OTHER'] as const;
export const playCarVehicleTypeEnum = z.enum(playCarVehicleTypeValues);
export type PlayCarVehicleType = z.infer<typeof playCarVehicleTypeEnum>;

const playCarSharedFields = {
  name: z.string().optional(),
  brand: z.string().optional(),
  type: z.string().optional(),
  fuel: playCarFuelEnum.optional(),
  purchaseDate: playCarPurchaseDateEnum.optional(),
  manual: z.boolean().optional(),
  seats: z.coerce.number().int().optional(),
  doors: z.coerce.number().int().optional(),
  year: z.coerce.number().int().optional(),
  fuelEconomy: z.coerce.number().optional(),
  estimatedValue: z.coerce.number().optional(),
  ownerAnnualKm: z.coerce.number().optional(),
  carInitialMileage: z.coerce.number().optional(),
  comments: z.string().optional(),
  location: z
    .object({
      city: z.string().optional(),
      street: z.string().optional(),
      num: z.string().optional(),
      zip: z.string().optional(),
    })
    .optional(),
  insurance: z
    .object({
      name: z.string().optional(),
      expiration: z.string().optional(),
      bonusMalus: z.string().optional(),
      annualDueDate: z.string().optional(),
    })
    .optional(),
  technicalCarDetails: z
    .object({
      licensePlate: z.string().optional(),
      kiloWatt: z.coerce.number().optional(),
    })
    .optional(),
};

export const playCarCreateInputSchema = z.object(playCarSharedFields).strict();

export type PlayCarCreateInput = z.infer<typeof playCarCreateInputSchema>;

export const playCarUpdateInputSchema = z
  .object({
    ...playCarSharedFields,
    email: z.string().optional(),
    startSharing: z.string().optional(),
    carAgreedValue: z.coerce.number().optional(),
    deprec: z.coerce.number().optional(),
    chassisNumber: z.string().optional(),
    carType: playCarVehicleTypeEnum.optional(),
    assistanceName: z.string().optional(),
    assistanceExpiration: z.string().optional(),
    country: z.string().optional(),
  })
  .strict();

export type PlayCarUpdateInput = z.infer<typeof playCarUpdateInputSchema>;

const playCarUpdateOnlyKeys = [
  'email',
  'startSharing',
  'carAgreedValue',
  'deprec',
  'chassisNumber',
  'carType',
  'assistanceName',
  'assistanceExpiration',
  'country',
] as const;

export const toPlayCarCreateInput = (input: PlayCarUpdateInput): PlayCarCreateInput => {
  const create = { ...input };
  for (const key of playCarUpdateOnlyKeys) {
    delete create[key];
  }
  return playCarCreateInputSchema.parse(create);
};
