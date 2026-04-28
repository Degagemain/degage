import { cookies, headers } from 'next/headers';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, Pencil } from 'lucide-react';
import { getTranslations } from 'next-intl/server';

import { auth } from '@/auth';
import { readDocumentationByExternalId } from '@/actions/documentation/read-by-external-id';
import { DocumentationMarkdown } from '@/app/components/documentation/documentation-markdown';
import { Button } from '@/app/components/ui/button';
import { isAdmin } from '@/domain/role.utils';
import { type UILocale, defaultUILocale, getContentLocale, uiLocales } from '@/i18n/locales';

type PageProps = {
  params: Promise<{ externalId: string }>;
};

export default async function DocumentationDetailPage({ params }: PageProps) {
  const { externalId: raw } = await params;
  const externalId = decodeURIComponent(raw);

  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user || !isAdmin(session.user)) {
    notFound();
  }

  const doc = await readDocumentationByExternalId(externalId);
  if (!doc) {
    notFound();
  }

  const cookieLocale = (await cookies()).get('locale')?.value;
  const ui = cookieLocale && uiLocales.includes(cookieLocale as UILocale) ? (cookieLocale as UILocale) : defaultUILocale;
  const contentLocale = getContentLocale(ui);

  const translation =
    doc.translations.find((tr) => tr.locale === contentLocale) ?? doc.translations.find((tr) => tr.locale === 'en') ?? doc.translations[0];

  if (!translation) {
    notFound();
  }

  const t = await getTranslations('admin.documentation');
  const editHref = `/app/admin/documentation/${encodeURIComponent(doc.externalId)}/edit`;
  const listHref = '/app/admin/documentation';

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="border-b px-3 md:px-4">
        <div className="flex h-14 items-center justify-between gap-3">
          <Button variant="ghost" size="sm" className="shrink-0 gap-1.5 px-2" asChild>
            <Link href={listHref}>
              <ArrowLeft className="size-4" />
              <span className="hidden sm:inline">{t('detail.backToList')}</span>
            </Link>
          </Button>
          <Button variant="outline" size="sm" className="shrink-0 gap-1.5" asChild>
            <Link href={editHref}>
              <Pencil className="size-4" />
              {t('edit')}
            </Link>
          </Button>
        </div>
      </div>

      <div className="mx-auto w-full max-w-4xl flex-1 overflow-y-auto p-4 md:p-6">
        {doc.format === 'markdown' ? (
          <DocumentationMarkdown markdown={translation.content} />
        ) : (
          <pre className="text-muted-foreground font-sans text-sm leading-relaxed whitespace-pre-wrap">{translation.content}</pre>
        )}
      </div>
    </div>
  );
}
