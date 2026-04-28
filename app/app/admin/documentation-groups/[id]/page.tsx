'use client';

import { useCallback, useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Save } from 'lucide-react';
import { toast } from 'sonner';

import type { DocumentationGroup } from '@/domain/documentation-group.model';
import { apiPut } from '@/app/lib/api-client';
import { parseApiErrorMessage } from '@/app/lib/parse-api-error-message';
import { Button } from '@/app/components/ui/button';
import { Skeleton } from '@/app/components/ui/skeleton';
import { DOCUMENTATION_GROUP_FORM_ID, DocumentationGroupForm } from '../components/documentation-group-form';

const DOCUMENTATION_GROUPS_OVERVIEW_PATH = '/app/admin/documentation-groups';

export default function EditDocumentationGroupPage() {
  const tCommon = useTranslations('admin.common');
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;

  const [group, setGroup] = useState<DocumentationGroup | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadGroup = useCallback(async () => {
    if (!id) {
      setError(tCommon('feedback.loadError'));
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/documentation-groups/${id}`);
      if (!response.ok) {
        throw new Error(tCommon('feedback.loadError'));
      }
      const data: DocumentationGroup = await response.json();
      setGroup(data);
    } catch {
      setError(tCommon('feedback.loadError'));
    } finally {
      setIsLoading(false);
    }
  }, [id, tCommon]);

  useEffect(() => {
    void loadGroup();
  }, [loadGroup]);

  const handleUpdate = async (updated: DocumentationGroup) => {
    if (!id) return;
    setIsSaving(true);
    try {
      const response = await apiPut(`/api/documentation-groups/${id}`, { ...updated, id });

      if (!response.ok) {
        const message = await parseApiErrorMessage(response, tCommon('feedback.saveError'));
        toast.error(message);
        return;
      }

      toast.success(tCommon('feedback.saveSuccess'));
      router.push(DOCUMENTATION_GROUPS_OVERVIEW_PATH);
    } catch {
      toast.error(tCommon('feedback.saveError'));
    } finally {
      setIsSaving(false);
    }
  };

  if (error || (!isLoading && !group)) {
    return (
      <div className="flex min-h-[200px] flex-1 items-center justify-center p-4">
        <p className="text-muted-foreground">{error ?? tCommon('feedback.loadError')}</p>
      </div>
    );
  }

  if (isLoading || !group) {
    return (
      <div className="flex min-h-[240px] flex-1 flex-col gap-4 p-4">
        <Skeleton className="h-10 w-full max-w-md" />
        <Skeleton className="h-32 w-full max-w-md" />
      </div>
    );
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="border-b px-3 md:px-4">
        <div className="flex h-14 items-center justify-start gap-2">
          <Button type="submit" form={DOCUMENTATION_GROUP_FORM_ID} disabled={isSaving} variant="outline" size="sm">
            <Save className="size-3.5" />
            {isSaving ? tCommon('status.saving') : tCommon('actions.save')}
          </Button>
        </div>
      </div>
      <DocumentationGroupForm initialGroup={group} formId={DOCUMENTATION_GROUP_FORM_ID} isSubmitting={isSaving} onSubmit={handleUpdate} />
    </div>
  );
}
