import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/integrations/gemini', () => ({
  generateStructuredJsonFromImage: vi.fn(),
}));

import { analyzeRegistrationCertificate } from '@/actions/document/analyze-registration-certificate';
import { generateStructuredJsonFromImage } from '@/integrations/gemini';

const fileBody = Buffer.from('image-data');

describe('analyzeRegistrationCertificate', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('calls Gemini with image and returns parsed analysis', async () => {
    vi.mocked(generateStructuredJsonFromImage).mockResolvedValueOnce({
      isRegistrationDocument: true,
      side: 'front',
      vin: 'WVWZZZ3CZWE123456',
      plate: '1-ABC-123',
      firstRegisteredAt: '2020-03-15',
      ownerName: 'Jane Doe',
      ownerStreet: 'Main Street 1',
      ownerZip: 1000,
      ownerCity: 'Brussels',
    });

    const result = await analyzeRegistrationCertificate({
      body: fileBody,
      contentType: 'image/jpeg',
    });

    expect(generateStructuredJsonFromImage).toHaveBeenCalledWith(
      expect.stringContaining('vehicle registration certificate'),
      { data: fileBody, mimeType: 'image/jpeg' },
      expect.objectContaining({
        type: 'OBJECT',
        required: ['isRegistrationDocument'],
      }),
    );
    expect(result).toEqual({
      isRegistrationDocument: true,
      side: 'front',
      vin: 'WVWZZZ3CZWE123456',
      plate: '1-ABC-123',
      firstRegisteredAt: new Date('2020-03-15'),
      ownerName: 'Jane Doe',
      ownerStreet: 'Main Street 1',
      ownerZip: 1000,
      ownerCity: 'Brussels',
    });
  });

  it('returns non-registration result with null fields', async () => {
    vi.mocked(generateStructuredJsonFromImage).mockResolvedValueOnce({
      isRegistrationDocument: false,
      side: null,
      vin: null,
      plate: null,
      firstRegisteredAt: null,
      ownerName: null,
      ownerStreet: null,
      ownerZip: null,
      ownerCity: null,
    });

    const result = await analyzeRegistrationCertificate({
      body: fileBody,
      contentType: 'image/png',
    });

    expect(result.isRegistrationDocument).toBe(false);
    expect(result.side).toBeNull();
    expect(result.vin).toBeNull();
  });
});
