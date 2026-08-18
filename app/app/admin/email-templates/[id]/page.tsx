'use client';

import { useCallback, useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Save, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

import type { EmailTemplate } from '@/domain/email-template.model';
import { apiDelete, apiPut } from '@/app/lib/api-client';
import { parseApiErrorMessage } from '@/app/lib/parse-api-error-message';
import { DeleteConfirmationDialog } from '@/app/components/delete-confirmation-dialog';
import { Button } from '@/app/components/ui/button';
import { Skeleton } from '@/app/components/ui/skeleton';
import { EMAIL_TEMPLATE_FORM_ID, EmailTemplateForm } from '../components/email-template-form';
import { AdminPageToolbar } from '@/app/admin/components/admin-page-toolbar';

const OVERVIEW_PATH = '/app/admin/email-templates';

export default function EditEmailTemplatePage() {
  const t = useTranslations('admin.emailTemplates');
  const tCommon = useTranslations('admin.common');
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;

  const [template, setTemplate] = useState<EmailTemplate | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadTemplate = useCallback(async () => {
    if (!id) {
      setError(tCommon('feedback.loadError'));
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/email-templates/${id}`);
      if (!response.ok) {
        throw new Error(tCommon('feedback.loadError'));
      }
      const data: EmailTemplate = await response.json();
      setTemplate(data);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : tCommon('feedback.loadError'));
    } finally {
      setIsLoading(false);
    }
  }, [id, tCommon]);

  useEffect(() => {
    loadTemplate();
  }, [loadTemplate]);

  const handleSave = async (payload: EmailTemplate) => {
    if (!id) return;
    setIsSaving(true);
    try {
      const response = await apiPut(`/api/email-templates/${id}`, { ...payload, id });

      if (!response.ok) {
        const message = await parseApiErrorMessage(response, tCommon('feedback.saveError'));
        toast.error(message);
        return;
      }

      toast.success(tCommon('feedback.saveSuccess'));
      await loadTemplate();
    } catch {
      toast.error(tCommon('feedback.saveError'));
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!id) return;
    const response = await apiDelete(`/api/email-templates/${id}`);
    if (response.ok) {
      toast.success(t('delete.success'));
      setIsDeleteDialogOpen(false);
      router.push(OVERVIEW_PATH);
      return;
    }
    toast.error(t('delete.error'));
  };

  if (error) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <div className="text-center">
          <p className="text-destructive font-medium">{error}</p>
          <button onClick={loadTemplate} className="text-muted-foreground mt-2 text-sm underline hover:no-underline">
            {t('tryAgain')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="flex min-h-0 flex-1 flex-col">
        <AdminPageToolbar>
          <Button type="submit" form={EMAIL_TEMPLATE_FORM_ID} disabled={isLoading || isSaving || !template} variant="outline" size="sm">
            <Save className="size-3.5" />
            {isSaving ? tCommon('status.saving') : tCommon('actions.save')}
          </Button>
          <Button variant="outline" size="sm" onClick={() => setIsDeleteDialogOpen(true)} disabled={isLoading || isSaving || !template}>
            <Trash2 className="size-3.5" />
            {t('delete.confirm')}
          </Button>
        </AdminPageToolbar>

        {isLoading ? (
          <div className="space-y-6 px-3 py-4 md:px-4">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-40 w-full" />
          </div>
        ) : (
          template && (
            <EmailTemplateForm formId={EMAIL_TEMPLATE_FORM_ID} initialTemplate={template} isSubmitting={isSaving} onSubmit={handleSave} />
          )
        )}
      </div>

      <DeleteConfirmationDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={handleDelete}
        title={t('delete.title')}
        description={t('delete.description', { name: template ? t(`codes.${template.code}`) : '' })}
        confirmLabel={t('delete.confirm')}
        cancelLabel={t('delete.cancel')}
      />
    </>
  );
}
