import { cookies, headers } from 'next/headers';
import { notFound } from 'next/navigation';

import { auth } from '@/auth';
import { getDocumentationByExternalIdForViewer } from '@/actions/documentation/get-by-external-id-for-viewer';
import { isAdmin } from '@/domain/role.utils';
import { type UILocale, defaultUILocale, getContentLocale, uiLocales } from '@/i18n/locales';
import { DocViewBody } from '@/app/docs/[externalId]/doc-view-body';

type PageProps = {
  params: Promise<{ externalId: string }>;
};

export default async function DocumentationViewPage({ params }: PageProps) {
  const { externalId: raw } = await params;
  const externalId = decodeURIComponent(raw);

  const session = await auth.api.getSession({ headers: await headers() });
  const isViewerAdmin = session?.user ? isAdmin(session.user) : false;

  const cookieLocale = (await cookies()).get('locale')?.value;
  const ui = cookieLocale && uiLocales.includes(cookieLocale as UILocale) ? (cookieLocale as UILocale) : defaultUILocale;
  const contentLocale = getContentLocale(ui);

  const result = await getDocumentationByExternalIdForViewer(externalId, contentLocale, isViewerAdmin);

  if (!result.ok && result.reason === 'not_found') {
    notFound();
  }

  if (!result.ok && result.reason === 'forbidden') {
    return (
      <div className="flex min-h-[40vh] flex-col items-center justify-center px-4">
        <h1 className="text-lg font-semibold">Access denied</h1>
        <p className="text-muted-foreground mt-2 text-center text-sm">You do not have permission to view this documentation.</p>
      </div>
    );
  }

  if (!result.ok) {
    notFound();
  }

  return <DocViewBody doc={result.doc} />;
}
