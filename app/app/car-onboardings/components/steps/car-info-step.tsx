'use client';

import { useTranslations } from 'next-intl';
import { toast } from 'sonner';

import { isCarOlderThanFourYears } from '@/domain/car-onboarding.model';
import { apiPutForm } from '@/app/lib/api-client';
import { parseApiErrorMessage } from '@/app/lib/parse-api-error-message';

import { PublicPanel, PublicReadOnlyValue } from '../public-ui';
import { PublicRegistrationCertificateField } from '../public-registration-certificate-field';
import { StepActions } from '../step-actions';
import { StepLayout } from '../step-layout';
import { useStepReadOnly } from '../step-read-only-context';
import { useCarOnboarding } from '../../lib/car-onboarding-context';
import styles from '../../car-onboarding-public.module.css';

const formatDate = (value: Date | string | null): string => {
  if (value == null) return '—';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return '—';
  return parsed.toLocaleDateString();
};

const formatBool = (value: boolean, t: (key: string) => string): string => (value ? t('yes') : t('no'));

export function CarInfoStep() {
  const t = useTranslations('carOnboardingPublic');
  const tCert = useTranslations('carOnboardingPublic.steps.carInfo.registrationCertificate');
  const tInspection = useTranslations('carOnboardingPublic.steps.carInfo.inspectionCertificate');
  const tPink = useTranslations('carOnboardingPublic.steps.carInfo.pinkForm');
  const tShared = useTranslations('common');
  const tAdmin = useTranslations('admin.carOnboardings');
  const readOnly = useStepReadOnly();
  const { carOnboarding, reload, isLocked } = useCarOnboarding();
  const hasOtherCarType = Boolean(carOnboarding.carTypeOther?.trim()) && carOnboarding.carType == null;
  const uploadDisabled = readOnly || isLocked;
  const inspectionRequired = isCarOlderThanFourYears(carOnboarding.firstRegisteredAt);
  const inspectionUploadDisabled = uploadDisabled || !inspectionRequired;

  const handleUpload = async (side: 'front' | 'back', file: File) => {
    if (!carOnboarding.id) return;
    const formData = new FormData();
    formData.append('file', file);
    const response = await apiPutForm(`/api/car-onboardings/${carOnboarding.id}/registration-certificate/${side}`, formData);
    if (!response.ok) {
      const message = await parseApiErrorMessage(response, tCert('uploadError'), {
        document_not_recognized: tCert('notRecognizedError'),
      });
      toast.error(message);
      throw new Error(message);
    }
    toast.success(tCert('uploadSuccess'));
    await reload();
  };

  const handleDownload = async (side: 'front' | 'back') => {
    if (!carOnboarding.id) return;
    const response = await fetch(`/api/car-onboardings/${carOnboarding.id}/registration-certificate/${side}/view-url`);
    if (!response.ok) {
      const message = await parseApiErrorMessage(response, tCert('downloadError'));
      toast.error(message);
      throw new Error(message);
    }
    const data: { url: string } = await response.json();
    window.open(data.url, '_blank', 'noopener,noreferrer');
  };

  const handleUploadInspection = async (file: File) => {
    if (!carOnboarding.id) return;
    const formData = new FormData();
    formData.append('file', file);
    const response = await apiPutForm(`/api/car-onboardings/${carOnboarding.id}/inspection-certificate`, formData);
    if (!response.ok) {
      const message = await parseApiErrorMessage(response, tInspection('uploadError'), {
        document_not_recognized: tInspection('notRecognizedError'),
      });
      toast.error(message);
      throw new Error(message);
    }
    toast.success(tInspection('uploadSuccess'));
    await reload();
  };

  const handleDownloadInspection = async () => {
    if (!carOnboarding.id) return;
    const response = await fetch(`/api/car-onboardings/${carOnboarding.id}/inspection-certificate/view-url`);
    if (!response.ok) {
      const message = await parseApiErrorMessage(response, tInspection('downloadError'));
      toast.error(message);
      throw new Error(message);
    }
    const data: { url: string } = await response.json();
    window.open(data.url, '_blank', 'noopener,noreferrer');
  };

  const handleUploadPink = async (file: File) => {
    if (!carOnboarding.id) return;
    const formData = new FormData();
    formData.append('file', file);
    const response = await apiPutForm(`/api/car-onboardings/${carOnboarding.id}/pink-form`, formData);
    if (!response.ok) {
      const message = await parseApiErrorMessage(response, tPink('uploadError'), {
        document_not_recognized: tPink('notRecognizedError'),
      });
      toast.error(message);
      throw new Error(message);
    }
    toast.success(tPink('uploadSuccess'));
    await reload();
  };

  const handleDownloadPink = async () => {
    if (!carOnboarding.id) return;
    const response = await fetch(`/api/car-onboardings/${carOnboarding.id}/pink-form/view-url`);
    if (!response.ok) {
      const message = await parseApiErrorMessage(response, tPink('downloadError'));
      toast.error(message);
      throw new Error(message);
    }
    const data: { url: string } = await response.json();
    window.open(data.url, '_blank', 'noopener,noreferrer');
  };

  return (
    <StepLayout stepId="car-info">
      <PublicPanel title={t('steps.carInfo.panelTitle')} body={t('steps.carInfo.panelSubtitle')}>
        {hasOtherCarType ? (
          <PublicReadOnlyValue label={tAdmin('columns.carTypeOther')} value={carOnboarding.carTypeOther ?? ''} />
        ) : (
          <>
            <PublicReadOnlyValue label={tAdmin('columns.brand')} value={carOnboarding.brand?.name ?? ''} />
            <PublicReadOnlyValue label={tAdmin('columns.fuelType')} value={carOnboarding.fuelType?.name ?? ''} />
            <PublicReadOnlyValue label={tAdmin('columns.carType')} value={carOnboarding.carType?.name ?? ''} />
          </>
        )}
        <PublicReadOnlyValue label={tAdmin('columns.mileage')} value={String(carOnboarding.mileage)} />
        <PublicReadOnlyValue label={tAdmin('columns.seats')} value={String(carOnboarding.seats)} />
        {!carOnboarding.isNewCar ? (
          <PublicReadOnlyValue label={tAdmin('columns.firstRegisteredAt')} value={formatDate(carOnboarding.firstRegisteredAt)} />
        ) : null}
        <PublicReadOnlyValue label={tAdmin('columns.isVan')} value={formatBool(carOnboarding.isVan, tShared)} />
      </PublicPanel>

      {carOnboarding.isPurchased ? (
        <PublicPanel title={tAdmin('columns.isPurchased')}>
          <PublicReadOnlyValue label={tAdmin('columns.purchasePrice')} value={String(carOnboarding.purchasePrice)} />
          {!carOnboarding.isNewCar ? (
            <PublicRegistrationCertificateField
              label={tPink('label')}
              hint={tPink('hint')}
              fileName={carOnboarding.pinkForm?.name}
              disabled={uploadDisabled}
              namespace="pinkForm"
              onUpload={handleUploadPink}
              onDownload={carOnboarding.pinkForm ? handleDownloadPink : undefined}
            />
          ) : null}
        </PublicPanel>
      ) : (
        <PublicPanel title={tCert('panelTitle')}>
          <PublicRegistrationCertificateField
            label={tCert('frontLabel')}
            hint={tCert('frontHint')}
            fileName={carOnboarding.registrationCertificateFront?.name}
            disabled={uploadDisabled}
            onUpload={(file) => handleUpload('front', file)}
            onDownload={carOnboarding.registrationCertificateFront ? () => handleDownload('front') : undefined}
          />
          <PublicRegistrationCertificateField
            label={tCert('backLabel')}
            hint={tCert('backHint')}
            fileName={carOnboarding.registrationCertificateBack?.name}
            disabled={uploadDisabled}
            onUpload={(file) => handleUpload('back', file)}
            onDownload={carOnboarding.registrationCertificateBack ? () => handleDownload('back') : undefined}
          />
          <PublicReadOnlyValue label={tCert('vinLabel')} value={carOnboarding.vin ?? ''} />
          <PublicReadOnlyValue label={tCert('plateLabel')} value={carOnboarding.plate ?? ''} />
        </PublicPanel>
      )}

      {!carOnboarding.isPurchased ? (
        <div className={!inspectionRequired ? styles.panelDisabled : undefined}>
          <PublicPanel title={tInspection('panelTitle')}>
            {!inspectionRequired ? <p className={styles.fieldHint}>{tInspection('notYetRequired')}</p> : null}
            <PublicRegistrationCertificateField
              label={tInspection('label')}
              hint={tInspection('hint')}
              fileName={carOnboarding.inspectionCertificate?.name}
              disabled={inspectionUploadDisabled}
              namespace="inspectionCertificate"
              onUpload={handleUploadInspection}
              onDownload={carOnboarding.inspectionCertificate ? handleDownloadInspection : undefined}
            />
          </PublicPanel>
        </div>
      ) : null}

      <StepActions stepId="car-info" showSave={false} />
    </StepLayout>
  );
}
