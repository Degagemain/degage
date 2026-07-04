import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/integrations/gemini', () => ({
  generateStructuredJsonFromImage: vi.fn(),
}));

import { analyzeInspectionCertificate } from '@/actions/document/analyze-inspection-certificate';
import { generateStructuredJsonFromImage } from '@/integrations/gemini';

const fileBody = Buffer.from('image-data');

describe('analyzeInspectionCertificate', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('calls Gemini with image and returns parsed analysis', async () => {
    vi.mocked(generateStructuredJsonFromImage).mockResolvedValueOnce({
      isInspectionCertificate: true,
    });

    const result = await analyzeInspectionCertificate({
      body: fileBody,
      contentType: 'image/jpeg',
    });

    expect(generateStructuredJsonFromImage).toHaveBeenCalledWith(
      expect.stringContaining('inspection certificate'),
      { data: fileBody, mimeType: 'image/jpeg' },
      expect.objectContaining({
        type: 'OBJECT',
        required: ['isInspectionCertificate'],
      }),
    );
    expect(result).toEqual({ isInspectionCertificate: true });
  });

  it('returns non-inspection result', async () => {
    vi.mocked(generateStructuredJsonFromImage).mockResolvedValueOnce({
      isInspectionCertificate: false,
    });

    const result = await analyzeInspectionCertificate({
      body: fileBody,
      contentType: 'image/png',
    });

    expect(result.isInspectionCertificate).toBe(false);
  });
});
