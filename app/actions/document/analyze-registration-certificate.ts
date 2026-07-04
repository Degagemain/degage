import type { Schema } from '@google/genai';
import { Type } from '@google/genai';

import { type RegistrationCertificateAnalysis, registrationCertificateAnalysisSchema } from '@/domain/registration-certificate-analysis.model';
import { generateStructuredJsonFromImage } from '@/integrations/gemini';

export type AnalyzeRegistrationCertificateInput = {
  body: Buffer;
  contentType: string;
};

const responseSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    isRegistrationDocument: {
      type: Type.BOOLEAN,
      description: 'Whether the image is a vehicle registration certificate (registration document)',
    },
    vin: { type: Type.STRING, nullable: true, description: 'Full VIN number' },
    plate: { type: Type.STRING, nullable: true, description: 'License plate number' },
    firstRegisteredAt: {
      type: Type.STRING,
      nullable: true,
      description: 'First registration date in YYYY-MM-DD format',
    },
    ownerName: { type: Type.STRING, nullable: true, description: 'Registered owner full name' },
    ownerStreet: { type: Type.STRING, nullable: true, description: 'Owner address street' },
    ownerZip: { type: Type.INTEGER, nullable: true, description: 'Owner address postal code as integer' },
    ownerCity: { type: Type.STRING, nullable: true, description: 'Owner address city' },
  },
  required: ['isRegistrationDocument'],
};

const buildPrompt = (): string => {
  return [
    'Analyze this image of a vehicle registration certificate (registration document).',
    'Determine whether this is really a vehicle registration document.',
    'If it is, extract the following fields from the document:',
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
  const raw = await generateStructuredJsonFromImage<RegistrationCertificateAnalysis>(
    prompt,
    { data: input.body, mimeType: input.contentType },
    responseSchema,
  );
  const analysis = registrationCertificateAnalysisSchema.parse(raw);
  return analysis;
};
