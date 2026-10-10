import { headers } from 'next/headers';
import { getLocale } from 'next-intl/server';

import { auth } from '@/auth';
import { getDocumentationByShortLinkForViewer } from '@/actions/documentation/get-by-short-link-for-viewer';
import { isAdmin } from '@/domain/role.utils';
import { getContentLocale } from '@/i18n/locales';

import { FaqArticleDetail, FaqArticleUnavailable } from '../components/faq-article-detail';

type PageProps = {
  params: Promise<{ shortLink: string }>;
};

export default async function FaqShortLinkPage({ params }: PageProps) {
  const { shortLink: raw } = await params;
  const shortLink = decodeURIComponent(raw);

  const [session, locale] = await Promise.all([auth.api.getSession({ headers: await headers() }), getLocale()]);
  const isViewerAdmin = session?.user ? isAdmin(session.user) : false;

  const result = await getDocumentationByShortLinkForViewer(shortLink, getContentLocale(locale), isViewerAdmin);

  if (!result.ok) {
    return <FaqArticleUnavailable />;
  }

  const doc = result.doc;

  return <FaqArticleDetail title={doc.title} content={doc.content} format={doc.format} />;
}
