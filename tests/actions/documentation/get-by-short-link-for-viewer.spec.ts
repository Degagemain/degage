import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/storage/documentation/documentation.get-by-short-link', () => ({
  dbDocumentationGetByShortLink: vi.fn(),
}));

import { getDocumentationByShortLinkForViewer } from '@/actions/documentation/get-by-short-link-for-viewer';
import { dbDocumentationGetByShortLink } from '@/storage/documentation/documentation.get-by-short-link';
import { documentation } from '../../builders/documentation.builder';

describe('getDocumentationByShortLinkForViewer', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('returns the public article for a short link', async () => {
    vi.mocked(dbDocumentationGetByShortLink).mockResolvedValueOnce(
      documentation({
        audienceRoles: ['public'],
        externalId: 'faq-38-de-eigenaar-ontvangt-een-boete-vastgesteld-tijdens-e',
        isFaq: true,
        isPublic: true,
        shortLink: 'boete',
        translations: [{ locale: 'nl', title: 'Boete', content: 'Uitleg' }],
      }),
    );

    const result = await getDocumentationByShortLinkForViewer('Boete', 'nl', false);

    expect(dbDocumentationGetByShortLink).toHaveBeenCalledWith('boete');
    expect(result).toEqual({
      ok: true,
      doc: {
        externalId: 'faq-38-de-eigenaar-ontvangt-een-boete-vastgesteld-tijdens-e',
        source: 'manual',
        format: 'markdown',
        title: 'Boete',
        content: 'Uitleg',
        locale: 'nl',
      },
    });
  });

  it('returns not_found for an unknown short link', async () => {
    vi.mocked(dbDocumentationGetByShortLink).mockResolvedValueOnce(null);
    const result = await getDocumentationByShortLinkForViewer('missing', 'nl', false);
    expect(result).toEqual({ ok: false, reason: 'not_found' });
  });

  it('returns not_found for an invalid short link without querying', async () => {
    const result = await getDocumentationByShortLinkForViewer('my link', 'nl', false);
    expect(result).toEqual({ ok: false, reason: 'not_found' });
    expect(dbDocumentationGetByShortLink).not.toHaveBeenCalled();
  });

  it('returns forbidden when the article is not public', async () => {
    vi.mocked(dbDocumentationGetByShortLink).mockResolvedValueOnce(
      documentation({ audienceRoles: ['public'], isPublic: false, shortLink: 'boete' }),
    );
    const result = await getDocumentationByShortLinkForViewer('boete', 'en', true);
    expect(result).toEqual({ ok: false, reason: 'forbidden' });
  });
});
