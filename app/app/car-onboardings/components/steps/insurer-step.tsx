'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';

import { isInsurerContractStartedWithinLastYear, shouldClearShareStartOnInsurerChange } from '@/domain/car-onboarding.model';
import { formatDateForInput, parseDateInput } from '@/app/components/form/date-input-helpers';
import { apiPut } from '@/app/lib/api-client';
import { parseApiErrorMessage } from '@/app/lib/parse-api-error-message';

import { PublicField, PublicInfoPanel, PublicInput, PublicPanel } from '../public-ui';
import { PublicSearchableField } from '../public-searchable-field';
import { StepActions } from '../step-actions';
import { StepLayout } from '../step-layout';
import { useCarOnboarding } from '../../lib/car-onboarding-context';
import styles from '../../car-onboarding-public.module.css';

const addOneYear = (dateStr: string): string => {
  const d = parseDateInput(dateStr);
  if (d == null) return '';
  d.setFullYear(d.getFullYear() + 1);
  return d.toLocaleDateString();
};

const addTwoMonthsFromToday = (): string => {
  const d = new Date();
  d.setMonth(d.getMonth() + 2);
  return d.toLocaleDateString();
};

export function InsurerStep() {
  const t = useTranslations('carOnboardingPublic');
  const tAdmin = useTranslations('admin.carOnboardings');
  const { carOnboarding, reload } = useCarOnboarding();

  const [hasInsuranceContract, setHasInsuranceContract] = useState(carOnboarding.hasInsuranceContract);
  const [insurerId, setInsurerId] = useState(carOnboarding.insurer?.id ?? '');
  const [insurerName, setInsurerName] = useState(carOnboarding.insurer?.name ?? '');
  const [supportsInstantOnboarding, setSupportsInstantOnboarding] = useState(carOnboarding.insurer?.supportsInstantOnboarding === true);
  const [contractStartedAt, setContractStartedAt] = useState(formatDateForInput(carOnboarding.insurerContractStartedAt));
  const [insurerAnnouncedPriceIncrease, setInsurerAnnouncedPriceIncrease] = useState(carOnboarding.insurerAnnouncedPriceIncrease);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setHasInsuranceContract(carOnboarding.hasInsuranceContract);
    setInsurerId(carOnboarding.insurer?.id ?? '');
    setInsurerName(carOnboarding.insurer?.name ?? '');
    setSupportsInstantOnboarding(carOnboarding.insurer?.supportsInstantOnboarding === true);
    setContractStartedAt(formatDateForInput(carOnboarding.insurerContractStartedAt));
    setInsurerAnnouncedPriceIncrease(carOnboarding.insurerAnnouncedPriceIncrease);
  }, [carOnboarding]);

  const hasContractDate = hasInsuranceContract && contractStartedAt !== '';
  const showRecentContract = hasContractDate && isInsurerContractStartedWithinLastYear(contractStartedAt);
  const showWaitPeriodBanners = hasContractDate && !supportsInstantOnboarding;
  const showCancellableContract = showWaitPeriodBanners && !isInsurerContractStartedWithinLastYear(contractStartedAt);

  const handleSave = async (): Promise<boolean> => {
    if (!carOnboarding.id) return false;
    const nextInsurance = {
      hasInsuranceContract,
      insurerContractStartedAt: hasInsuranceContract && contractStartedAt ? parseDateInput(contractStartedAt) : null,
      insurer: hasInsuranceContract && insurerId ? { id: insurerId, name: insurerName, supportsInstantOnboarding } : null,
    };
    const willClearShareStart = shouldClearShareStartOnInsurerChange(carOnboarding, nextInsurance);
    setIsSaving(true);
    try {
      const response = await apiPut(`/api/car-onboardings/${carOnboarding.id}/insurer`, {
        hasInsuranceContract,
        ...(hasInsuranceContract && insurerId ? { insurer: { id: insurerId, name: insurerName, supportsInstantOnboarding } } : {}),
        ...(hasInsuranceContract && contractStartedAt
          ? {
              insurerContractStartedAt: contractStartedAt,
              ...(showRecentContract ? { insurerAnnouncedPriceIncrease } : {}),
            }
          : {}),
      });
      if (!response.ok) {
        toast.error(await parseApiErrorMessage(response, t('errors.save')));
        return false;
      }
      toast.success(t('saveSuccess'));
      await reload();
      if (willClearShareStart) {
        toast.message(t('steps.insurer.shareStartCleared'));
      }
      return true;
    } catch {
      toast.error(t('errors.save'));
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <StepLayout stepId="insurer">
      <PublicInfoPanel title={t('steps.insurer.panelTitle')} body={t('steps.insurer.panelBody')} />
      {carOnboarding.shareStartDate != null ? <div className={styles.bannerWarning}>{t('steps.insurer.shareStartResetWarning')}</div> : null}
      <PublicPanel>
        <label className={styles.checkboxLabel}>
          <PublicInput type="checkbox" checked={hasInsuranceContract} onChange={(e) => setHasInsuranceContract(e.target.checked)} />
          <span>{t('steps.insurer.hasInsuranceContractLabel')}</span>
        </label>
        {hasInsuranceContract ? (
          <>
            <PublicSearchableField
              label={tAdmin('columns.insurer')}
              value={insurerId}
              selectedLabel={insurerName || undefined}
              onValueChange={(id, option) => {
                setInsurerId(id);
                setInsurerName(option.name);
                setSupportsInstantOnboarding(option.supportsInstantOnboarding === true);
              }}
              apiPath="insurers"
              passThroughKeys={['supportsInstantOnboarding']}
              placeholder={tAdmin('form.placeholders.insurer')}
            />
            <PublicField label={tAdmin('columns.insurerContractStartedAt')} hint={t('steps.insurer.contractStartedAtHint')}>
              <PublicInput type="date" value={contractStartedAt} onChange={(e) => setContractStartedAt(e.target.value)} />
            </PublicField>
            {showRecentContract ? (
              <PublicField
                label={t('steps.insurer.insurerAnnouncedPriceIncreaseLabel')}
                hint={t('steps.insurer.insurerAnnouncedPriceIncreaseHint')}
              >
                <label className={styles.checkboxLabel}>
                  <PublicInput
                    type="checkbox"
                    checked={insurerAnnouncedPriceIncrease}
                    onChange={(e) => setInsurerAnnouncedPriceIncrease(e.target.checked)}
                  />
                  <span>{t('steps.insurer.insurerAnnouncedPriceIncreaseCheckbox')}</span>
                </label>
              </PublicField>
            ) : null}
          </>
        ) : null}
      </PublicPanel>

      {showWaitPeriodBanners && showRecentContract ? (
        <div className={styles.bannerWarning}>{t('steps.insurer.contractWarning', { date: addOneYear(contractStartedAt) })}</div>
      ) : null}

      {showCancellableContract ? (
        <div className={styles.bannerWarning}>{t('steps.insurer.contractWarningCancellable', { date: addTwoMonthsFromToday() })}</div>
      ) : null}

      <StepActions stepId="insurer" onSave={handleSave} saveDisabled={isSaving} />
    </StepLayout>
  );
}
