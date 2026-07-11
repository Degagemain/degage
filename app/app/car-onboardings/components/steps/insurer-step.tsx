'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';

import { apiPut } from '@/app/lib/api-client';
import { parseApiErrorMessage } from '@/app/lib/parse-api-error-message';

import { PublicField, PublicInput, PublicPanel } from '../public-ui';
import { PublicSearchableField } from '../public-searchable-field';
import { StepActions } from '../step-actions';
import { StepLayout } from '../step-layout';
import { useCarOnboarding } from '../../lib/car-onboarding-context';
import styles from '../../car-onboarding-public.module.css';

const addOneYear = (dateStr: string): string => {
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return '';
  d.setFullYear(d.getFullYear() + 1);
  return d.toLocaleDateString();
};

const isLessThanOneYearAgo = (dateStr: string): boolean => {
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return false;
  const oneYearAgo = new Date();
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
  return d > oneYearAgo;
};

const formatDateInput = (date: Date | string | null): string => {
  if (date == null) return '';
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return '';
  return parsed.toISOString().slice(0, 10);
};

export function InsurerStep() {
  const t = useTranslations('carOnboardingPublic');
  const tAdmin = useTranslations('admin.carOnboardings');
  const { carOnboarding, reload } = useCarOnboarding();

  const [hasInsurance, setHasInsurance] = useState(carOnboarding.hasInsurance);
  const [insurerId, setInsurerId] = useState(carOnboarding.insurer?.id ?? '');
  const [insurerName, setInsurerName] = useState(carOnboarding.insurer?.name ?? '');
  const [contractStartedAt, setContractStartedAt] = useState(formatDateInput(carOnboarding.insurerContractStartedAt));
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setHasInsurance(carOnboarding.hasInsurance);
    setInsurerId(carOnboarding.insurer?.id ?? '');
    setInsurerName(carOnboarding.insurer?.name ?? '');
    setContractStartedAt(formatDateInput(carOnboarding.insurerContractStartedAt));
  }, [carOnboarding]);

  const showWarning = hasInsurance && contractStartedAt !== '' && isLessThanOneYearAgo(contractStartedAt);
  const canSave = hasInsurance ? Boolean(insurerId && contractStartedAt) : true;

  const handleSave = async () => {
    if (!carOnboarding.id || !canSave) return;
    setIsSaving(true);
    try {
      const response = await apiPut(`/api/car-onboardings/${carOnboarding.id}/insurer`, {
        hasInsurance,
        ...(hasInsurance
          ? {
              insurer: { id: insurerId, name: insurerName },
              insurerContractStartedAt: contractStartedAt,
            }
          : {}),
      });
      if (!response.ok) {
        toast.error(await parseApiErrorMessage(response, t('errors.save')));
        return;
      }
      toast.success(t('saveSuccess'));
      await reload();
    } catch {
      toast.error(t('errors.save'));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <StepLayout stepId="insurer">
      <PublicPanel title={t('steps.insurer.panelTitle')}>
        <PublicField label={tAdmin('columns.hasInsurance')} hint={t('steps.insurer.hasInsuranceHint')}>
          <label className={styles.checkboxLabel}>
            <PublicInput type="checkbox" checked={hasInsurance} onChange={(e) => setHasInsurance(e.target.checked)} />
            <span>{t('steps.insurer.hasInsuranceLabel')}</span>
          </label>
        </PublicField>
        {hasInsurance ? (
          <>
            <PublicField label={tAdmin('columns.insurerContractStartedAt')}>
              <PublicInput type="date" value={contractStartedAt} onChange={(e) => setContractStartedAt(e.target.value)} />
            </PublicField>
            <PublicSearchableField
              label={tAdmin('columns.insurer')}
              value={insurerId}
              selectedLabel={insurerName || undefined}
              onValueChange={(id, option) => {
                setInsurerId(id);
                setInsurerName(option.name);
              }}
              apiPath="insurers"
              placeholder={tAdmin('form.placeholders.insurer')}
            />
          </>
        ) : null}
      </PublicPanel>

      {showWarning ? (
        <div className={styles.bannerWarning}>{t('steps.insurer.contractWarning', { date: addOneYear(contractStartedAt) })}</div>
      ) : null}

      <StepActions stepId="insurer" onSave={() => void handleSave()} saveDisabled={isSaving || !canSave} />
    </StepLayout>
  );
}
