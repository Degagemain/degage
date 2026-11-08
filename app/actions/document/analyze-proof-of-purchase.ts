import * as z from 'zod';

import { type ProofOfPurchaseAnalysis, proofOfPurchaseAnalysisSchema } from '@/domain/proof-of-purchase-analysis.model';
import { generateStructuredJsonFromImage } from '@/integrations/gemini';

export type AnalyzeProofOfPurchaseInput = {
  body: Buffer;
  contentType: string;
};

const responseSchema = z.object({
  isProofOfPurchase: z
    .boolean()
    .describe('Whether the image is a proof of purchase for a new car (invoice, dealer receipt, sales contract, or order confirmation)'),
  purchasePriceInclVat: z.number().nullable().describe('Total purchase amount including VAT, in euros'),
});

const buildPrompt = (): string => {
  return [
    'Analyze this image and determine whether it is a proof of purchase for a new car',
    '(invoice, dealer receipt, sales contract, or order confirmation).',
    'The purchase price including VAT must be clearly visible on the document.',
    'If it is a proof of purchase, extract the total purchase amount including VAT as a number in euros',
    '(no currency symbol, no thousands separators).',
    'If the image is not a proof of purchase, or the purchase price including VAT is not clearly visible,',
    'set isProofOfPurchase to false and purchasePriceInclVat to null.',
  ].join(' ');
};

export const analyzeProofOfPurchase = async (input: AnalyzeProofOfPurchaseInput): Promise<ProofOfPurchaseAnalysis> => {
  const prompt = buildPrompt();
  const raw = await generateStructuredJsonFromImage(
    prompt,
    { data: input.body, mimeType: input.contentType },
    responseSchema,
    'proof-of-purchase-analysis',
  );
  const analysis = proofOfPurchaseAnalysisSchema.parse(raw);
  return analysis;
};
