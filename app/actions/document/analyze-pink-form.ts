import type { Schema } from '@google/genai';
import { Type } from '@google/genai';

import { type PinkFormAnalysis, pinkFormAnalysisSchema } from '@/domain/pink-form-analysis.model';
import { generateStructuredJsonFromImage } from '@/integrations/gemini';

export type AnalyzePinkFormInput = {
  body: Buffer;
  contentType: string;
};

const responseSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    isPinkForm: {
      type: Type.BOOLEAN,
      description: 'Whether the image is a pink form (vehicle purchase transfer document)',
    },
  },
  required: ['isPinkForm'],
};

const buildPrompt = (): string => {
  return [
    'Analyze this image and determine whether it is a pink form (vehicle purchase transfer document).',
    'If the image is not a pink form, set isPinkForm to false.',
  ].join(' ');
};

export const analyzePinkForm = async (input: AnalyzePinkFormInput): Promise<PinkFormAnalysis> => {
  const prompt = buildPrompt();
  const raw = await generateStructuredJsonFromImage<PinkFormAnalysis>(
    prompt,
    { data: input.body, mimeType: input.contentType },
    responseSchema,
  );
  const analysis = pinkFormAnalysisSchema.parse(raw);
  return analysis;
};
