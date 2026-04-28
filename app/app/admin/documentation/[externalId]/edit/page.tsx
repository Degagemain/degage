import { headers } from 'next/headers';
import { notFound } from 'next/navigation';

import { auth } from '@/auth';
import { readDocumentationByExternalId } from '@/actions/documentation/read-by-external-id';
import { DocumentationEditForm } from '@/app/admin/documentation/components/documentation-edit-form';
import { isAdmin } from '@/domain/role.utils';

type PageProps = {
  params: Promise<{ externalId: string }>;
};

export default async function EditDocumentationPage({ params }: PageProps) {
  const { externalId: raw } = await params;
  const externalId = decodeURIComponent(raw);

  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user || !isAdmin(session.user)) {
    notFound();
  }

  const doc = await readDocumentationByExternalId(externalId);
  if (!doc?.id) {
    notFound();
  }

  return <DocumentationEditForm initialDocumentation={doc} />;
}
