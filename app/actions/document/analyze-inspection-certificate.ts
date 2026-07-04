import type { Schema } from '@google/genai';
import { Type } from '@google/genai';

import { type InspectionCertificateAnalysis, inspectionCertificateAnalysisSchema } from '@/domain/inspection-certificate-analysis.model';
import { generateStructuredJsonFromImage } from '@/integrations/gemini';

export type AnalyzeInspectionCertificateInput = {
  body: Buffer;
  contentType: string;
};

const responseSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    isInspectionCertificate: {
      type: Type.BOOLEAN,
      description: 'Whether the image is a vehicle inspection certificate (technical inspection document)',
    },
  },
  required: ['isInspectionCertificate'],
};

const buildPrompt = (): string => {
  return [
    'Analyze this image and determine whether it is a vehicle inspection certificate (technical inspection document).',
    'If the image is not an inspection certificate, set isInspectionCertificate to false.',
  ].join(' ');
};

export const analyzeInspectionCertificate = async (input: AnalyzeInspectionCertificateInput): Promise<InspectionCertificateAnalysis> => {
  const prompt = buildPrompt();
  const raw = await generateStructuredJsonFromImage<InspectionCertificateAnalysis>(
    prompt,
    { data: input.body, mimeType: input.contentType },
    responseSchema,
  );
  const analysis = inspectionCertificateAnalysisSchema.parse(raw);
  return analysis;
};
