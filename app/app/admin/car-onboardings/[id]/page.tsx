'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { ExternalLink, Save, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

import { CarOnboarding } from '@/domain/car-onboarding.model';
import { apiDelete, apiPut, apiPutForm } from '@/app/lib/api-client';
import { parseApiErrorMessage } from '@/app/lib/parse-api-error-message';
import { DeleteConfirmationDialog } from '@/app/components/delete-confirmation-dialog';
import { Button } from '@/app/components/ui/button';
import { Skeleton } from '@/app/components/ui/skeleton';
import { CAR_ONBOARDING_FORM_ID, CarOnboardingForm, type CarOnboardingTabId, parseCarOnboardingTab } from '../components/car-onboarding-form';

const OVERVIEW_PATH = '/app/admin/car-onboardings';

export default function EditCarOnboardingPage() {
  const t = useTranslations('admin.carOnboardings');
  const tCommon = useTranslations('admin.common');
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const params = useParams<{ id: string }>();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const activeTab = parseCarOnboardingTab(searchParams.get('tab'));

  const setActiveTab = useCallback(
    (tab: CarOnboardingTabId) => {
      const nextParams = new URLSearchParams(searchParams.toString());
      nextParams.set('tab', tab);
      router.replace(`${pathname}?${nextParams.toString()}`, { scroll: false });
    },
    [pathname, router, searchParams],
  );

  const [carOnboarding, setCarOnboarding] = useState<CarOnboarding | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadCarOnboarding = useCallback(
    async (options?: { silent?: boolean }) => {
      if (!id) {
        setError(tCommon('feedback.loadError'));
        setIsLoading(false);
        return;
      }
      if (!options?.silent) {
        setIsLoading(true);
      }
      setError(null);
      try {
        const response = await fetch(`/api/car-onboardings/${id}`);
        if (!response.ok) {
          throw new Error(tCommon('feedback.loadError'));
        }
        const data: CarOnboarding = await response.json();
        setCarOnboarding(data);
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : tCommon('feedback.loadError'));
      } finally {
        if (!options?.silent) {
          setIsLoading(false);
        }
      }
    },
    [id, tCommon],
  );

  useEffect(() => {
    loadCarOnboarding();
  }, [loadCarOnboarding]);

  const handleSave = async (payload: CarOnboarding) => {
    if (!id) return;
    setIsSaving(true);
    try {
      const response = await apiPut(`/api/car-onboardings/${id}`, { ...payload, id });

      if (!response.ok) {
        const message = await parseApiErrorMessage(response, tCommon('feedback.saveError'));
        toast.error(message);
        return;
      }

      toast.success(tCommon('feedback.saveSuccess'));
      await loadCarOnboarding({ silent: true });
    } catch {
      toast.error(tCommon('feedback.saveError'));
    } finally {
      setIsSaving(false);
    }
  };

  const handleOverruleCarValueAgreement = async () => {
    if (!id) return;
    try {
      const response = await apiPut(`/api/car-onboardings/${id}/car-value/overrule`);

      if (!response.ok) {
        const message = await parseApiErrorMessage(response, t('form.overruleAgreementError'));
        toast.error(message);
        return;
      }

      toast.success(t('form.overruleAgreementSuccess'));
      await loadCarOnboarding({ silent: true });
    } catch {
      toast.error(t('form.overruleAgreementError'));
    }
  };

  const handleConfirmInfoSession = async () => {
    if (!id) return;
    try {
      const response = await apiPut(`/api/car-onboardings/${id}/info-session/confirm`);

      if (!response.ok) {
        const message = await parseApiErrorMessage(response, t('form.confirmInfoSessionError'));
        toast.error(message);
        return;
      }

      toast.success(t('form.confirmInfoSessionSuccess'));
      await loadCarOnboarding({ silent: true });
    } catch {
      toast.error(t('form.confirmInfoSessionError'));
    }
  };

  const handleStartCarOnboarding = async () => {
    if (!id) return;
    try {
      const response = await apiPut(`/api/car-onboardings/${id}/start`);

      if (!response.ok) {
        const message = await parseApiErrorMessage(response, t('form.startOnboardingError'));
        toast.error(message);
        return;
      }

      toast.success(t('form.startOnboardingSuccess'));
      await loadCarOnboarding({ silent: true });
    } catch {
      toast.error(t('form.startOnboardingError'));
    }
  };

  const handleUploadRegistrationCertificate = async (side: 'front' | 'back', file: File) => {
    if (!id) return;
    const formData = new FormData();
    formData.append('file', file);
    const response = await apiPutForm(`/api/car-onboardings/${id}/registration-certificate/${side}`, formData);
    if (!response.ok) {
      const message = await parseApiErrorMessage(response, t('form.registrationCertificate.uploadError'), {
        document_not_recognized: t('form.registrationCertificate.notRecognizedError'),
      });
      toast.error(message);
      throw new Error(message);
    }
    toast.success(t('form.registrationCertificate.uploadSuccess'));
    await loadCarOnboarding({ silent: true });
  };

  const handleDownloadRegistrationCertificate = async (side: 'front' | 'back') => {
    if (!id) return;
    const response = await fetch(`/api/car-onboardings/${id}/registration-certificate/${side}/view-url`);
    if (!response.ok) {
      const message = await parseApiErrorMessage(response, t('form.registrationCertificate.downloadError'));
      toast.error(message);
      throw new Error(message);
    }
    const data: { url: string } = await response.json();
    window.open(data.url, '_blank', 'noopener,noreferrer');
  };

  const handleUploadInspectionCertificate = async (file: File) => {
    if (!id) return;
    const formData = new FormData();
    formData.append('file', file);
    const response = await apiPutForm(`/api/car-onboardings/${id}/inspection-certificate`, formData);
    if (!response.ok) {
      const message = await parseApiErrorMessage(response, t('form.inspectionCertificate.uploadError'), {
        document_not_recognized: t('form.inspectionCertificate.notRecognizedError'),
      });
      toast.error(message);
      throw new Error(message);
    }
    toast.success(t('form.inspectionCertificate.uploadSuccess'));
    await loadCarOnboarding({ silent: true });
  };

  const handleDownloadInspectionCertificate = async () => {
    if (!id) return;
    const response = await fetch(`/api/car-onboardings/${id}/inspection-certificate/view-url`);
    if (!response.ok) {
      const message = await parseApiErrorMessage(response, t('form.inspectionCertificate.downloadError'));
      toast.error(message);
      throw new Error(message);
    }
    const data: { url: string } = await response.json();
    window.open(data.url, '_blank', 'noopener,noreferrer');
  };

  const handleUploadPinkForm = async (file: File) => {
    if (!id) return;
    const formData = new FormData();
    formData.append('file', file);
    const response = await apiPutForm(`/api/car-onboardings/${id}/pink-form`, formData);
    if (!response.ok) {
      const message = await parseApiErrorMessage(response, t('form.pinkForm.uploadError'), {
        document_not_recognized: t('form.pinkForm.notRecognizedError'),
      });
      toast.error(message);
      throw new Error(message);
    }
    toast.success(t('form.pinkForm.uploadSuccess'));
    await loadCarOnboarding({ silent: true });
  };

  const handleDownloadPinkForm = async () => {
    if (!id) return;
    const response = await fetch(`/api/car-onboardings/${id}/pink-form/view-url`);
    if (!response.ok) {
      const message = await parseApiErrorMessage(response, t('form.pinkForm.downloadError'));
      toast.error(message);
      throw new Error(message);
    }
    const data: { url: string } = await response.json();
    window.open(data.url, '_blank', 'noopener,noreferrer');
  };

  const handleDelete = async () => {
    if (!id) return;
    const response = await apiDelete(`/api/car-onboardings/${id}`);
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

  const deleteLabel = carOnboarding
    ? [carOnboarding.brand?.name, carOnboarding.town?.name].filter(Boolean).join(' · ') || carOnboarding.id
    : '';

  if (error) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <div className="text-center">
          <p className="text-destructive font-medium">{error}</p>
          <button
            type="button"
            onClick={() => void loadCarOnboarding()}
            className="text-muted-foreground mt-2 text-sm underline hover:no-underline"
          >
            {t('tryAgain')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="flex min-h-0 flex-1 flex-col">
        <div className="border-b px-3 md:px-4">
          <div className="flex h-14 items-center justify-start gap-2">
            <Button type="submit" form={CAR_ONBOARDING_FORM_ID} disabled={isLoading || isSaving || !carOnboarding} variant="outline" size="sm">
              <Save className="size-3.5" />
              {isSaving ? tCommon('status.saving') : tCommon('actions.save')}
            </Button>
            <Button variant="outline" size="sm" onClick={() => setIsDeleteDialogOpen(true)} disabled={isLoading || isSaving || !carOnboarding}>
              <Trash2 className="size-3.5" />
              {t('delete.confirm')}
            </Button>
            {carOnboarding?.simulation?.id ? (
              <Button variant="outline" size="sm" asChild>
                <Link href={`/app/admin/simulations/${carOnboarding.simulation.id}`}>
                  <ExternalLink className="size-3.5" />
                  {t('form.openSimulation')}
                </Link>
              </Button>
            ) : null}
            {carOnboarding?.id ? (
              <Button variant="outline" size="sm" asChild>
                <Link href={`/app/car-onboardings/${carOnboarding.id}`}>
                  <ExternalLink className="size-3.5" />
                  {t('form.openPublicPage')}
                </Link>
              </Button>
            ) : null}
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-6 px-3 py-4 md:px-4">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
          </div>
        ) : (
          carOnboarding && (
            <CarOnboardingForm
              formId={CAR_ONBOARDING_FORM_ID}
              initialCarOnboarding={carOnboarding}
              isSubmitting={isSaving}
              activeTab={activeTab}
              onTabChange={setActiveTab}
              onSubmit={handleSave}
              onOverruleCarValueAgreement={handleOverruleCarValueAgreement}
              onConfirmInfoSession={handleConfirmInfoSession}
              onStartCarOnboarding={handleStartCarOnboarding}
              onUploadRegistrationCertificate={handleUploadRegistrationCertificate}
              onDownloadRegistrationCertificate={handleDownloadRegistrationCertificate}
              onUploadInspectionCertificate={handleUploadInspectionCertificate}
              onDownloadInspectionCertificate={handleDownloadInspectionCertificate}
              onUploadPinkForm={handleUploadPinkForm}
              onDownloadPinkForm={handleDownloadPinkForm}
            />
          )
        )}
      </div>

      <DeleteConfirmationDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={handleDelete}
        title={t('delete.title')}
        description={t('delete.description', { name: deleteLabel ?? '' })}
        confirmLabel={t('delete.confirm')}
        cancelLabel={t('delete.cancel')}
      />
    </>
  );
}
