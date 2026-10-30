import { unstable_cache } from 'next/cache';

import type { ContentLocale } from '@/i18n/locales';
import { cacheTags } from '@/lib/cache-tags';
import type { GetDocumentationForViewerResult } from './documentation-for-viewer';
import { getDocumentationByExternalIdForViewer } from './get-by-external-id-for-viewer';
import { getDocumentationByShortLinkForViewer } from './get-by-short-link-for-viewer';

export const findFaqArticleForViewer = async (
  slug: string,
  locale: ContentLocale,
  isViewerAdmin: boolean,
): Promise<GetDocumentationForViewerResult> => {
  const byExternalId = await getDocumentationByExternalIdForViewer(slug, locale, isViewerAdmin, { publicCatalogOnly: true });
  if (byExternalId.ok || byExternalId.reason === 'forbidden') {
    return byExternalId;
  }
  return getDocumentationByShortLinkForViewer(slug, locale, isViewerAdmin);
};

// Seed scripts write documentation outside Next.js and cannot expire the tag, so entries also expire after an hour.
export const getFaqArticleForViewer = unstable_cache(findFaqArticleForViewer, ['faq-article-for-viewer'], {
  tags: [cacheTags.documentation],
  revalidate: 3600,
});
