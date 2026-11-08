import * as z from 'zod';

import {
  type RegistrationCertificateAnalysis,
  registrationCertificateAnalysisSchema,
  registrationCertificateSideSchema,
} from '@/domain/registration-certificate-analysis.model';
import { generateStructuredJsonFromImage } from '@/integrations/gemini';

export type AnalyzeRegistrationCertificateInput = {
  body: Buffer;
  contentType: string;
};

const responseSchema = z.object({
  isRegistrationDocument: z.boolean().describe('Whether the image is a vehicle registration certificate (registration document)'),
  side: registrationCertificateSideSchema.nullable().describe('Which side of the registration document is shown: front or back'),
  vin: z.string().nullable().describe('Full VIN number'),
  plate: z.string().nullable().describe('License plate number'),
  firstRegisteredAt: z.string().nullable().describe('First registration date in YYYY-MM-DD format'),
  ownerName: z.string().nullable().describe('Registered owner full name'),
  ownerStreet: z.string().nullable().describe('Owner address street'),
  ownerZip: z.number().int().nullable().describe('Owner address postal code as integer'),
  ownerCity: z.string().nullable().describe('Owner address city'),
});

const buildPrompt = (): string => {
  return [
    'Analyze this image of a vehicle registration certificate (registration document).',
    'Determine whether this is really a vehicle registration document.',
    'If it is, determine whether the image shows the front side or the back side of the document (return "front" or "back" for side).',
    'If it is the front side, extract the following fields from the document:',
    '1. Full VIN number',
    '2. License plate number',
    '3. First registration date (return as YYYY-MM-DD)',
    '4. Registered owner name',
    '5. Owner address street',
    '6. Owner address postal code (as integer)',
    '7. Owner address city',
    'If a field cannot be read or is not present, return null for that field.',
    'If the image is not a registration document, set isRegistrationDocument to false and return null for all other fields.',
  ].join(' ');
};

export const analyzeRegistrationCertificate = async (input: AnalyzeRegistrationCertificateInput): Promise<RegistrationCertificateAnalysis> => {
  const prompt = buildPrompt();
  const raw = await generateStructuredJsonFromImage(
    prompt,
    { data: input.body, mimeType: input.contentType },
    responseSchema,
    'registration-certificate-analysis',
  );
  const analysis = registrationCertificateAnalysisSchema.parse(raw);
  return analysis;
};
