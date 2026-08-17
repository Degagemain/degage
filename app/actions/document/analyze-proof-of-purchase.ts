import type { Schema } from '@google/genai';
import { Type } from '@google/genai';

import { type ProofOfPurchaseAnalysis, proofOfPurchaseAnalysisSchema } from '@/domain/proof-of-purchase-analysis.model';
import { generateStructuredJsonFromImage } from '@/integrations/gemini';

export type AnalyzeProofOfPurchaseInput = {
  body: Buffer;
  contentType: string;
};

const responseSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    isProofOfPurchase: {
      type: Type.BOOLEAN,
      description: 'Whether the image is a proof of purchase for a new car (invoice, dealer receipt, sales contract, or order confirmation)',
    },
    purchasePriceInclVat: {
      type: Type.NUMBER,
      nullable: true,
      description: 'Total purchase amount including VAT, in euros',
    },
  },
  required: ['isProofOfPurchase'],
};

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
  const raw = await generateStructuredJsonFromImage<ProofOfPurchaseAnalysis>(
    prompt,
    { data: input.body, mimeType: input.contentType },
    responseSchema,
  );
  const analysis = proofOfPurchaseAnalysisSchema.parse(raw);
  return analysis;
};
