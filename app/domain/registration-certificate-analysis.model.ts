import * as z from 'zod';

export const registrationCertificateSideSchema = z.enum(['front', 'back']);

export type RegistrationCertificateSide = z.infer<typeof registrationCertificateSideSchema>;

export const registrationCertificateAnalysisSchema = z
  .object({
    isRegistrationDocument: z.boolean(),
    side: registrationCertificateSideSchema.nullable(),
    vin: z.string().nullable(),
    plate: z.string().nullable(),
    firstRegisteredAt: z.coerce.date().nullable(),
    ownerName: z.string().nullable(),
    ownerStreet: z.string().nullable(),
    ownerZip: z.number().int().nullable(),
    ownerCity: z.string().nullable(),
  })
  .strict();

export type RegistrationCertificateAnalysis = z.infer<typeof registrationCertificateAnalysisSchema>;
