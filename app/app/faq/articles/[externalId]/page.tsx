import { headers } from 'next/headers';
import { getLocale, getTranslations } from 'next-intl/server';

import { auth } from '@/auth';
import { getDocumentationByExternalIdForViewer } from '@/actions/documentation/get-by-external-id-for-viewer';
import { DocumentationMarkdown } from '@/app/components/documentation/documentation-markdown';
import { PublicPage } from '@/app/components/public/public-shell';
import { isAdmin } from '@/domain/role.utils';
import { getContentLocale } from '@/i18n/locales';

import { FaqBackToHelpLink } from '../../components/faq-back-to-help-link';

type PageProps = {
  params: Promise<{ externalId: string }>;
};

export default async function FaqArticleDetailPage({ params }: PageProps) {
  const { externalId: raw } = await params;
  const externalId = decodeURIComponent(raw);

  const [session, locale, t] = await Promise.all([auth.api.getSession({ headers: await headers() }), getLocale(), getTranslations('faq')]);
  const isViewerAdmin = session?.user ? isAdmin(session.user) : false;

  const result = await getDocumentationByExternalIdForViewer(externalId, getContentLocale(locale), isViewerAdmin, { publicCatalogOnly: true });

  if (!result.ok) {
    return (
      <PublicPage>
        <FaqBackToHelpLink />
        <p className="text-muted-foreground text-sm">{t('errorLoad')}</p>
      </PublicPage>
    );
  }

  const doc = result.doc;

  return (
    <PublicPage>
      <FaqBackToHelpLink />
      <article>
        <h1 className="text-foreground mb-6 text-[28px] font-extrabold tracking-tight">{doc.title}</h1>
        <div className="documentation-body">
          {doc.format === 'markdown' ? (
            <DocumentationMarkdown markdown={doc.content} />
          ) : (
            <pre className="font-sans text-sm leading-relaxed whitespace-pre-wrap">{doc.content}</pre>
          )}
        </div>
      </article>
    </PublicPage>
  );
}
