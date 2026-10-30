import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('next/cache', () => ({
  unstable_cache: vi.fn((fn: unknown) => fn),
}));

vi.mock('@/actions/documentation/get-by-external-id-for-viewer', () => ({
  getDocumentationByExternalIdForViewer: vi.fn(),
}));

vi.mock('@/actions/documentation/get-by-short-link-for-viewer', () => ({
  getDocumentationByShortLinkForViewer: vi.fn(),
}));

import { getDocumentationByExternalIdForViewer } from '@/actions/documentation/get-by-external-id-for-viewer';
import { getDocumentationByShortLinkForViewer } from '@/actions/documentation/get-by-short-link-for-viewer';
import { findFaqArticleForViewer } from '@/actions/documentation/get-faq-article-for-viewer';

const article = {
  ok: true as const,
  doc: { externalId: 'faq-38', source: 'manual', format: 'markdown' as const, title: 'Boete', content: 'Uitleg', locale: 'nl' },
};

describe('findFaqArticleForViewer', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('returns the article found by external id from the public catalog', async () => {
    vi.mocked(getDocumentationByExternalIdForViewer).mockResolvedValueOnce(article);

    const result = await findFaqArticleForViewer('faq-38', 'nl', false);

    expect(result).toEqual(article);
    expect(getDocumentationByExternalIdForViewer).toHaveBeenCalledWith('faq-38', 'nl', false, { publicCatalogOnly: true });
    expect(getDocumentationByShortLinkForViewer).not.toHaveBeenCalled();
  });

  it('does not try the short link when the external id is forbidden', async () => {
    vi.mocked(getDocumentationByExternalIdForViewer).mockResolvedValueOnce({ ok: false, reason: 'forbidden' });

    const result = await findFaqArticleForViewer('faq-38', 'nl', false);

    expect(result).toEqual({ ok: false, reason: 'forbidden' });
    expect(getDocumentationByShortLinkForViewer).not.toHaveBeenCalled();
  });

  it('falls back to the short link when no article has the external id', async () => {
    vi.mocked(getDocumentationByExternalIdForViewer).mockResolvedValueOnce({ ok: false, reason: 'not_found' });
    vi.mocked(getDocumentationByShortLinkForViewer).mockResolvedValueOnce(article);

    const result = await findFaqArticleForViewer('boete', 'nl', true);

    expect(result).toEqual(article);
    expect(getDocumentationByShortLinkForViewer).toHaveBeenCalledWith('boete', 'nl', true);
  });
});
