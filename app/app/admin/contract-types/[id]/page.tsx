'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { ExternalLink, Save, Trash2, Upload } from 'lucide-react';
import { toast } from 'sonner';

import type { ContractType } from '@/domain/contract-type.model';
import { apiDelete, apiPut } from '@/app/lib/api-client';
import { parseApiErrorMessage } from '@/app/lib/parse-api-error-message';
import { DeleteConfirmationDialog } from '@/app/components/delete-confirmation-dialog';
import { Button } from '@/app/components/ui/button';
import { Skeleton } from '@/app/components/ui/skeleton';
import { Field, FieldContent, FieldDescription, FieldLabel } from '@/app/components/ui/field';
import { Input } from '@/app/components/ui/input';
import { CONTRACT_TYPE_FORM_ID, ContractTypeForm } from '../components/contract-type-form';
import { AdminPageToolbar } from '@/app/admin/components/admin-page-toolbar';

const OVERVIEW_PATH = '/app/admin/contract-types';

export default function EditContractTypePage() {
  const t = useTranslations('admin.contractTypes');
  const tCommon = useTranslations('admin.common');
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [contractType, setContractType] = useState<ContractType | null>(null);
  const [editorUrl, setEditorUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadContractType = useCallback(async () => {
    if (!id) {
      setError(tCommon('feedback.loadError'));
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const [typeResponse, templateResponse] = await Promise.all([
        fetch(`/api/contract-types/${id}`),
        fetch(`/api/contract-types/${id}/template`),
      ]);
      if (!typeResponse.ok) throw new Error(tCommon('feedback.loadError'));
      const data: ContractType = await typeResponse.json();
      setContractType(data);
      if (templateResponse.ok) {
        const template = (await templateResponse.json()) as { editorUrl: string | null };
        setEditorUrl(template.editorUrl);
      } else {
        setEditorUrl(null);
      }
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : tCommon('feedback.loadError'));
    } finally {
      setIsLoading(false);
    }
  }, [id, tCommon]);

  useEffect(() => {
    loadContractType();
  }, [loadContractType]);

  const handleSave = async (payload: ContractType) => {
    if (!id) return;
    setIsSaving(true);
    try {
      const response = await apiPut(`/api/contract-types/${id}`, { ...payload, id });
      if (!response.ok) {
        const message = await parseApiErrorMessage(response, tCommon('feedback.saveError'));
        toast.error(message);
        return;
      }
      toast.success(tCommon('feedback.saveSuccess'));
      await loadContractType();
    } catch {
      toast.error(tCommon('feedback.saveError'));
    } finally {
      setIsSaving(false);
    }
  };

  const handleUploadTemplate = async (file: File) => {
    if (!id) return;
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const response = await fetch(`/api/contract-types/${id}/template`, {
        method: 'POST',
        body: formData,
      });
      if (!response.ok) {
        const message = await parseApiErrorMessage(response, t('template.uploadError'));
        toast.error(message);
        return;
      }
      const result = (await response.json()) as {
        contractType: ContractType;
        editorUrl: string | null;
      };
      setContractType(result.contractType);
      setEditorUrl(result.editorUrl);
      toast.success(t('template.uploadSuccess'));
    } catch {
      toast.error(t('template.uploadError'));
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDelete = async () => {
    if (!id) return;
    const response = await apiDelete(`/api/contract-types/${id}`);
    if (response.ok) {
      toast.success(t('delete.success'));
      setIsDeleteDialogOpen(false);
      router.push(OVERVIEW_PATH);
      return;
    }
    if (response.status === 409) {
      toast.error(t('delete.conflict'));
      return;
    }
    toast.error(t('delete.error'));
  };

  if (error) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <div className="text-center">
          <p className="text-destructive font-medium">{error}</p>
          <button type="button" onClick={loadContractType} className="text-muted-foreground mt-2 text-sm underline hover:no-underline">
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
          <Button type="submit" form={CONTRACT_TYPE_FORM_ID} disabled={isLoading || isSaving || !contractType} variant="outline" size="sm">
            <Save className="size-3.5" />
            {isSaving ? tCommon('status.saving') : tCommon('actions.save')}
          </Button>
          <Button variant="outline" size="sm" onClick={() => setIsDeleteDialogOpen(true)} disabled={isLoading || isSaving || !contractType}>
            <Trash2 className="size-3.5" />
            {t('delete.confirm')}
          </Button>
        </AdminPageToolbar>

        {isLoading ? (
          <div className="space-y-6 px-3 py-4 md:px-4">
            <Skeleton className="h-20 w-full" />
          </div>
        ) : (
          contractType && (
            <>
              <ContractTypeForm
                formId={CONTRACT_TYPE_FORM_ID}
                initialContractType={contractType}
                isSubmitting={isSaving}
                onSubmit={handleSave}
              />
              <div className="max-w-2xl space-y-4 px-4 pb-8 md:px-6">
                <Field className="max-w-xl">
                  <FieldLabel>{t('columns.template')}</FieldLabel>
                  <FieldContent className="gap-3">
                    <p className="text-muted-foreground text-sm">
                      {contractType.documensoTemplateEnvelopeId ? t('template.ready') : t('template.missing')}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <Button type="button" variant="outline" size="sm" disabled={isUploading} onClick={() => fileInputRef.current?.click()}>
                        <Upload className="size-3.5" />
                        {isUploading ? t('template.uploading') : t('template.upload')}
                      </Button>
                      {editorUrl ? (
                        <Button type="button" variant="outline" size="sm" asChild>
                          <a href={editorUrl} target="_blank" rel="noreferrer">
                            <ExternalLink className="size-3.5" />
                            {t('template.open')}
                          </a>
                        </Button>
                      ) : null}
                    </div>
                    <Input
                      ref={fileInputRef}
                      type="file"
                      accept="application/pdf"
                      className="hidden"
                      onChange={(event) => {
                        const file = event.target.files?.[0];
                        if (file) void handleUploadTemplate(file);
                      }}
                    />
                    <FieldDescription>{t('form.help.template')}</FieldDescription>
                  </FieldContent>
                </Field>
              </div>
            </>
          )
        )}
      </div>

      <DeleteConfirmationDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={handleDelete}
        title={t('delete.title')}
        description={t('delete.description', { name: contractType?.code ?? '' })}
        confirmLabel={t('delete.confirm')}
        cancelLabel={t('delete.cancel')}
      />
    </>
  );
}
