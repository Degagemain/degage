import { documentationShortLinkProblem, normalizeDocumentationShortLink } from '@/domain/documentation-short-link';
import type { ContentLocale } from '@/i18n/locales';
import { dbDocumentationGetByShortLink } from '@/storage/documentation/documentation.get-by-short-link';
import { type GetDocumentationForViewerResult, documentationForViewer } from './documentation-for-viewer';

export const getDocumentationByShortLinkForViewer = async (
  rawShortLink: string,
  locale: ContentLocale,
  isViewerAdmin: boolean,
): Promise<GetDocumentationForViewerResult> => {
  const shortLink = normalizeDocumentationShortLink(rawShortLink);
  if (!shortLink || documentationShortLinkProblem(shortLink)) {
    return { ok: false, reason: 'not_found' };
  }
  const doc = await dbDocumentationGetByShortLink(shortLink);
  return documentationForViewer(doc, locale, isViewerAdmin, { publicCatalogOnly: true });
};
