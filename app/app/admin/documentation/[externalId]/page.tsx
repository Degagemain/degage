import { cookies, headers } from 'next/headers';
import { notFound } from 'next/navigation';

import { auth } from '@/auth';
import { getDocumentationByExternalIdForViewer } from '@/actions/documentation/get-by-external-id-for-viewer';
import { DocumentationMarkdown } from '@/app/components/documentation/documentation-markdown';
import { isAdmin } from '@/domain/role.utils';
import { type UILocale, defaultUILocale, getContentLocale, uiLocales } from '@/i18n/locales';

type PageProps = {
  params: Promise<{ externalId: string }>;
};

export default async function AdminDocumentationViewPage({ params }: PageProps) {
  const { externalId: raw } = await params;
  const externalId = decodeURIComponent(raw);

  const session = await auth.api.getSession({ headers: await headers() });
  const isViewerAdmin = session?.user ? isAdmin(session.user) : false;
  if (!isViewerAdmin) {
    notFound();
  }

  const cookieLocale = (await cookies()).get('locale')?.value;
  const ui = cookieLocale && uiLocales.includes(cookieLocale as UILocale) ? (cookieLocale as UILocale) : defaultUILocale;
  const contentLocale = getContentLocale(ui);

  const result = await getDocumentationByExternalIdForViewer(externalId, contentLocale, true);
  if (!result.ok) {
    notFound();
  }

  return (
    <div className="min-h-0 flex-1 overflow-y-auto">
      <div className="mx-auto w-full max-w-4xl p-4 md:p-6">
        <h1 className="mb-4 text-2xl font-semibold tracking-tight">{result.doc.title}</h1>
        {result.doc.format === 'markdown' ? (
          <DocumentationMarkdown markdown={result.doc.content} />
        ) : (
          <pre className="text-muted-foreground font-sans text-sm leading-relaxed whitespace-pre-wrap">{result.doc.content}</pre>
        )}
      </div>
    </div>
  );
}
