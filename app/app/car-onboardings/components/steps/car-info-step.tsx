'use client';

import { useTranslations } from 'next-intl';
import { toast } from 'sonner';

import { apiPutForm } from '@/app/lib/api-client';
import { parseApiErrorMessage } from '@/app/lib/parse-api-error-message';

import { PublicPanel, PublicReadOnlyValue } from '../public-ui';
import { PublicRegistrationCertificateField } from '../public-registration-certificate-field';
import { StepActions } from '../step-actions';
import { StepLayout } from '../step-layout';
import { useStepReadOnly } from '../step-read-only-context';
import { useCarOnboarding } from '../../lib/car-onboarding-context';

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
  const tShared = useTranslations('common');
  const tAdmin = useTranslations('admin.carOnboardings');
  const readOnly = useStepReadOnly();
  const { carOnboarding, reload, isLocked } = useCarOnboarding();
  const hasOtherCarType = Boolean(carOnboarding.carTypeOther?.trim()) && carOnboarding.carType == null;
  const uploadDisabled = readOnly || isLocked;

  const handleUpload = async (side: 'front' | 'back', file: File) => {
    if (!carOnboarding.id) return;
    const formData = new FormData();
    formData.append('file', file);
    const response = await apiPutForm(`/api/car-onboardings/${carOnboarding.id}/registration-certificate/${side}`, formData);
    if (!response.ok) {
      const message = await parseApiErrorMessage(response, tCert('uploadError'), {
        registration_certificate_not_recognized: tCert('notRecognizedError'),
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

      <StepActions stepId="car-info" showSave={false} />
    </StepLayout>
  );
}
