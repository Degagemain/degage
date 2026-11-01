'use client';

import { useCallback, useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { FileText, Save, Send, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

import type { Contract } from '@/domain/contract.model';
import { ContractStatus } from '@/domain/contract.model';
import { apiDelete, apiPost, apiPut } from '@/app/lib/api-client';
import { parseApiErrorMessage } from '@/app/lib/parse-api-error-message';
import { DeleteConfirmationDialog } from '@/app/components/delete-confirmation-dialog';
import { Button } from '@/app/components/ui/button';
import { Skeleton } from '@/app/components/ui/skeleton';
import { CONTRACT_FORM_ID, ContractForm } from '../components/contract-form';
import { AdminPageToolbar } from '@/app/admin/components/admin-page-toolbar';

const OVERVIEW_PATH = '/app/admin/contracts';

export default function EditContractPage() {
  const t = useTranslations('admin.contracts');
  const tCommon = useTranslations('admin.common');
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;

  const [contract, setContract] = useState<Contract | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadContract = useCallback(async () => {
    if (!id) {
      setError(tCommon('feedback.loadError'));
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/contracts/${id}`);
      if (!response.ok) throw new Error(tCommon('feedback.loadError'));
      const data: Contract = await response.json();
      setContract(data);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : tCommon('feedback.loadError'));
    } finally {
      setIsLoading(false);
    }
  }, [id, tCommon]);

  useEffect(() => {
    loadContract();
  }, [loadContract]);

  const isDraft = contract?.status === ContractStatus.Draft;

  const handleSave = async (payload: Contract) => {
    if (!id || !isDraft) return;
    setIsSaving(true);
    try {
      const response = await apiPut(`/api/contracts/${id}`, { ...payload, id });
      if (!response.ok) {
        const message = await parseApiErrorMessage(response, tCommon('feedback.saveError'));
        toast.error(message);
        return;
      }
      toast.success(tCommon('feedback.saveSuccess'));
      await loadContract();
    } catch {
      toast.error(tCommon('feedback.saveError'));
    } finally {
      setIsSaving(false);
    }
  };

  const handleSend = async () => {
    if (!id) return;
    setIsSending(true);
    try {
      const response = await apiPost(`/api/contracts/${id}/send`, {});
      if (!response.ok) {
        const message = await parseApiErrorMessage(response, t('send.error'));
        toast.error(message);
        return;
      }
      toast.success(t('send.success'));
      await loadContract();
    } catch {
      toast.error(t('send.error'));
    } finally {
      setIsSending(false);
    }
  };

  const handleOpenDocument = async () => {
    if (!id) return;
    const response = await fetch(`/api/contracts/${id}/document`);
    if (!response.ok) {
      const message = await parseApiErrorMessage(response, t('document.error'));
      toast.error(message);
      return;
    }
    const data = (await response.json()) as { url: string };
    window.open(data.url, '_blank', 'noopener,noreferrer');
  };

  const handleDelete = async () => {
    if (!id) return;
    const response = await apiDelete(`/api/contracts/${id}`);
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
          <button type="button" onClick={loadContract} className="text-muted-foreground mt-2 text-sm underline hover:no-underline">
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
          {isDraft ? (
            <Button type="submit" form={CONTRACT_FORM_ID} disabled={isLoading || isSaving || !contract} variant="outline" size="sm">
              <Save className="size-3.5" />
              {isSaving ? tCommon('status.saving') : tCommon('actions.save')}
            </Button>
          ) : null}
          {isDraft ? (
            <Button type="button" variant="outline" size="sm" disabled={isLoading || isSending || !contract} onClick={handleSend}>
              <Send className="size-3.5" />
              {isSending ? t('send.sending') : t('actions.send')}
            </Button>
          ) : null}
          {contract?.status === ContractStatus.Signed ? (
            <Button type="button" variant="outline" size="sm" disabled={isLoading} onClick={handleOpenDocument}>
              <FileText className="size-3.5" />
              {t('actions.openDocument')}
            </Button>
          ) : null}
          {isDraft ? (
            <Button variant="outline" size="sm" onClick={() => setIsDeleteDialogOpen(true)} disabled={isLoading || isSaving || !contract}>
              <Trash2 className="size-3.5" />
              {t('delete.confirm')}
            </Button>
          ) : null}
        </AdminPageToolbar>

        {isLoading ? (
          <div className="space-y-6 px-3 py-4 md:px-4">
            <Skeleton className="h-20 w-full" />
          </div>
        ) : (
          contract && (
            <>
              <div className="text-muted-foreground px-4 pt-4 text-sm md:px-6">
                {t('columns.status')}: {t(`statuses.${contract.status}`)}
              </div>
              <ContractForm
                formId={CONTRACT_FORM_ID}
                initialContract={contract}
                isSubmitting={isSaving}
                readOnly={!isDraft}
                onSubmit={handleSave}
              />
            </>
          )
        )}
      </div>

      <DeleteConfirmationDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={handleDelete}
        title={t('delete.title')}
        description={t('delete.description', { name: contract?.user.name ?? contract?.user.id ?? '' })}
        confirmLabel={t('delete.confirm')}
        cancelLabel={t('delete.cancel')}
      />
    </>
  );
}
