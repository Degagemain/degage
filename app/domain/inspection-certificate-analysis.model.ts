import * as z from 'zod';

export const inspectionCertificateAnalysisSchema = z
  .object({
    isInspectionCertificate: z.boolean(),
  })
  .strict();

export type InspectionCertificateAnalysis = z.infer<typeof inspectionCertificateAnalysisSchema>;
