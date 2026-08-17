import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/integrations/gemini', () => ({
  generateStructuredJsonFromImage: vi.fn(),
}));

import { analyzeProofOfPurchase } from '@/actions/document/analyze-proof-of-purchase';
import { generateStructuredJsonFromImage } from '@/integrations/gemini';

const fileBody = Buffer.from('image-data');

describe('analyzeProofOfPurchase', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('calls Gemini with image and returns parsed analysis', async () => {
    vi.mocked(generateStructuredJsonFromImage).mockResolvedValueOnce({
      isProofOfPurchase: true,
      purchasePriceInclVat: 24990.5,
    });

    const result = await analyzeProofOfPurchase({
      body: fileBody,
      contentType: 'image/jpeg',
    });

    expect(generateStructuredJsonFromImage).toHaveBeenCalledWith(
      expect.stringContaining('proof of purchase'),
      { data: fileBody, mimeType: 'image/jpeg' },
      expect.objectContaining({
        type: 'OBJECT',
        required: ['isProofOfPurchase'],
      }),
    );
    expect(result).toEqual({
      isProofOfPurchase: true,
      purchasePriceInclVat: 24990.5,
    });
  });

  it('returns non-proof-of-purchase result', async () => {
    vi.mocked(generateStructuredJsonFromImage).mockResolvedValueOnce({
      isProofOfPurchase: false,
      purchasePriceInclVat: null,
    });

    const result = await analyzeProofOfPurchase({
      body: fileBody,
      contentType: 'image/png',
    });

    expect(result.isProofOfPurchase).toBe(false);
    expect(result.purchasePriceInclVat).toBeNull();
  });
});
