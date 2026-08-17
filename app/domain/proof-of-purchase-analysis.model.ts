import * as z from 'zod';

export const proofOfPurchaseAnalysisSchema = z
  .object({
    isProofOfPurchase: z.boolean(),
    purchasePriceInclVat: z.number().nullable(),
  })
  .strict();

export type ProofOfPurchaseAnalysis = z.infer<typeof proofOfPurchaseAnalysisSchema>;
