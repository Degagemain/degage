import { headers } from 'next/headers';
import { getLocale } from 'next-intl/server';

import { auth } from '@/auth';
import { getFaqArticleForViewer } from '@/actions/documentation/get-faq-article-for-viewer';
import { isAdmin } from '@/domain/role.utils';
import { getContentLocale } from '@/i18n/locales';

import { FaqArticleDetail, FaqArticleUnavailable } from '../../components/faq-article-detail';

type PageProps = {
  params: Promise<{ externalId: string }>;
};

const isRequestFromAdmin = async (): Promise<boolean> => {
  const session = await auth.api.getSession({ headers: await headers() });
  return session?.user ? isAdmin(session.user) : false;
};

export default async function FaqArticleDetailPage({ params }: PageProps) {
  const { externalId: raw } = await params;
  const slug = decodeURIComponent(raw);
  const contentLocale = getContentLocale(await getLocale());

  const forVisitor = await getFaqArticleForViewer(slug, contentLocale, false);
  const result =
    forVisitor.ok || forVisitor.reason === 'not_found'
      ? forVisitor
      : await getFaqArticleForViewer(slug, contentLocale, await isRequestFromAdmin());

  if (!result.ok) {
    return <FaqArticleUnavailable />;
  }

  const doc = result.doc;

  return <FaqArticleDetail title={doc.title} content={doc.content} format={doc.format} />;
}
