import * as z from 'zod';

import { type InspectionCertificateAnalysis, inspectionCertificateAnalysisSchema } from '@/domain/inspection-certificate-analysis.model';
import { generateStructuredJsonFromImage } from '@/integrations/gemini';

export type AnalyzeInspectionCertificateInput = {
  body: Buffer;
  contentType: string;
};

const responseSchema = z.object({
  isInspectionCertificate: z.boolean().describe('Whether the image is a vehicle inspection certificate (technical inspection document)'),
});

const buildPrompt = (): string => {
  return [
    'Analyze this image and determine whether it is a vehicle inspection certificate (technical inspection document).',
    'If the image is not an inspection certificate, set isInspectionCertificate to false.',
  ].join(' ');
};

export const analyzeInspectionCertificate = async (input: AnalyzeInspectionCertificateInput): Promise<InspectionCertificateAnalysis> => {
  const prompt = buildPrompt();
  const raw = await generateStructuredJsonFromImage(
    prompt,
    { data: input.body, mimeType: input.contentType },
    responseSchema,
    'inspection-certificate-analysis',
  );
  const analysis = inspectionCertificateAnalysisSchema.parse(raw);
  return analysis;
};
