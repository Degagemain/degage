import { headers } from 'next/headers';
import { getLocale } from 'next-intl/server';

import { auth } from '@/auth';
import { getDocumentationByExternalIdForViewer } from '@/actions/documentation/get-by-external-id-for-viewer';
import { getDocumentationByShortLinkForViewer } from '@/actions/documentation/get-by-short-link-for-viewer';
import { isAdmin } from '@/domain/role.utils';
import { getContentLocale } from '@/i18n/locales';

import { FaqArticleDetail, FaqArticleUnavailable } from '../../components/faq-article-detail';

type PageProps = {
  params: Promise<{ externalId: string }>;
};

export default async function FaqArticleDetailPage({ params }: PageProps) {
  const { externalId: raw } = await params;
  const externalId = decodeURIComponent(raw);

  const [session, locale] = await Promise.all([auth.api.getSession({ headers: await headers() }), getLocale()]);
  const isViewerAdmin = session?.user ? isAdmin(session.user) : false;
  const contentLocale = getContentLocale(locale);

  const byExternalId = await getDocumentationByExternalIdForViewer(externalId, contentLocale, isViewerAdmin, { publicCatalogOnly: true });
  const result =
    byExternalId.ok || byExternalId.reason === 'forbidden'
      ? byExternalId
      : await getDocumentationByShortLinkForViewer(externalId, contentLocale, isViewerAdmin);

  if (!result.ok) {
    return <FaqArticleUnavailable />;
  }

  const doc = result.doc;

  return <FaqArticleDetail title={doc.title} content={doc.content} format={doc.format} />;
}
