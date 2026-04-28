'use client';

import { DOCUMENTATION_EDIT_FORM_ID, DocumentationEditForm } from '@/app/admin/documentation/components/documentation-edit-form';
import { emptyManualDocumentation } from '@/app/admin/documentation/components/empty-manual-documentation';

export default function NewDocumentationPage() {
  return <DocumentationEditForm initialDocumentation={emptyManualDocumentation()} formId={DOCUMENTATION_EDIT_FORM_ID} />;
}
