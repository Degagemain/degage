import * as z from 'zod';

import { type PinkFormAnalysis, pinkFormAnalysisSchema } from '@/domain/pink-form-analysis.model';
import { generateStructuredJsonFromImage } from '@/integrations/gemini';

export type AnalyzePinkFormInput = {
  body: Buffer;
  contentType: string;
};

const responseSchema = z.object({
  isPinkForm: z.boolean().describe('Whether the image is a pink form (vehicle purchase transfer document)'),
});

const buildPrompt = (): string => {
  return [
    'Analyze this image and determine whether it is a pink form (vehicle purchase transfer document).',
    'If the image is not a pink form, set isPinkForm to false.',
  ].join(' ');
};

export const analyzePinkForm = async (input: AnalyzePinkFormInput): Promise<PinkFormAnalysis> => {
  const prompt = buildPrompt();
  const raw = await generateStructuredJsonFromImage(
    prompt,
    { data: input.body, mimeType: input.contentType },
    responseSchema,
    'pink-form-analysis',
  );
  const analysis = pinkFormAnalysisSchema.parse(raw);
  return analysis;
};
