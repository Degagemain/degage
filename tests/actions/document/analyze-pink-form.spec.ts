import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/integrations/gemini', () => ({
  generateStructuredJsonFromImage: vi.fn(),
}));

import { analyzePinkForm } from '@/actions/document/analyze-pink-form';
import { generateStructuredJsonFromImage } from '@/integrations/gemini';

const fileBody = Buffer.from('image-data');

describe('analyzePinkForm', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('calls Gemini with image and returns parsed analysis', async () => {
    vi.mocked(generateStructuredJsonFromImage).mockResolvedValueOnce({
      isPinkForm: true,
    });

    const result = await analyzePinkForm({
      body: fileBody,
      contentType: 'image/jpeg',
    });

    expect(generateStructuredJsonFromImage).toHaveBeenCalledWith(
      expect.stringContaining('pink form'),
      { data: fileBody, mimeType: 'image/jpeg' },
      expect.objectContaining({
        type: 'OBJECT',
        required: ['isPinkForm'],
      }),
    );
    expect(result).toEqual({ isPinkForm: true });
  });

  it('returns non-pink-form result', async () => {
    vi.mocked(generateStructuredJsonFromImage).mockResolvedValueOnce({
      isPinkForm: false,
    });

    const result = await analyzePinkForm({
      body: fileBody,
      contentType: 'image/png',
    });

    expect(result.isPinkForm).toBe(false);
  });
});
