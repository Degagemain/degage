'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';

import { CarOnboardingCarValueStatus } from '@/domain/car-onboarding.model';
import { apiPut } from '@/app/lib/api-client';
import { parseApiErrorMessage } from '@/app/lib/parse-api-error-message';

import { PublicField, PublicInput, PublicPanel, PublicReadOnlyValue } from '../public-ui';
import { StepActions } from '../step-actions';
import { StepLayout } from '../step-layout';
import { useCarOnboarding } from '../../lib/car-onboarding-context';
import styles from '../../car-onboarding-public.module.css';

export function CarValueStep() {
  const t = useTranslations('carOnboardingPublic');
  const tAdmin = useTranslations('admin.carOnboardings');
  const { carOnboarding, reload } = useCarOnboarding();
  const [agreed, setAgreed] = useState<boolean | null>(null);
  const [counterValue, setCounterValue] = useState(String(carOnboarding.carValueCounterProposal || ''));
  const [counterMessage, setCounterMessage] = useState(carOnboarding.carValueCounterProposalMessage ?? '');
  const [isSaving, setIsSaving] = useState(false);

  const isPurchased = carOnboarding.isPurchased;
  const status = carOnboarding.carValueStatus;
  const proposedValue = carOnboarding.carValue;
  const purchasePrice = carOnboarding.purchasePrice;

  const formatEuro = (value: number) => `€ ${value.toLocaleString()}`;
  const formatDepreciation = (value: number) => value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const handleSave = async (): Promise<boolean> => {
    if (!carOnboarding.id) return false;
    setIsSaving(true);
    try {
      if (agreed === true) {
        const response = await apiPut(`/api/car-onboardings/${carOnboarding.id}/car-value/state`, {
          carValueStatus: CarOnboardingCarValueStatus.RESOLVED,
        });
        if (!response.ok) {
          toast.error(await parseApiErrorMessage(response, t('errors.save')));
          return false;
        }
      } else if (agreed === false) {
        const response = await apiPut(`/api/car-onboardings/${carOnboarding.id}/car-value`, {
          carValueCounterProposal: Number(counterValue),
          carValueCounterProposalMessage: counterMessage.trim() || null,
        });
        if (!response.ok) {
          toast.error(await parseApiErrorMessage(response, t('errors.save')));
          return false;
        }
      } else {
        return false;
      }
      toast.success(t('saveSuccess'));
      await reload();
      return true;
    } catch {
      toast.error(t('errors.save'));
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  const showProposalForm =
    !isPurchased && (status === CarOnboardingCarValueStatus.PROPOSAL || (status === CarOnboardingCarValueStatus.TODO && proposedValue > 0));
  const showPending = !isPurchased && status === CarOnboardingCarValueStatus.COUNTER;
  const showResolved = !isPurchased && status === CarOnboardingCarValueStatus.RESOLVED;
  const showWaiting = !isPurchased && status === CarOnboardingCarValueStatus.TODO && proposedValue <= 0;

  return (
    <StepLayout stepId="car-value">
      {showWaiting ? <p className={styles.pageIntro}>{t('steps.carValue.waitingForProposal')}</p> : null}

      {!showWaiting ? (
        <>
          {isPurchased ? (
            <PublicPanel title={tAdmin('columns.purchasePrice')}>
              <PublicField label={tAdmin('columns.purchasePrice')}>
                <p className={styles.readOnlyValue}>{formatEuro(purchasePrice)}</p>
              </PublicField>
            </PublicPanel>
          ) : null}

          {showProposalForm ? (
            <>
              <PublicPanel title={t('steps.carValue.agreeTitle')}>
                <PublicField label={tAdmin('columns.carValue')}>
                  <p className={styles.readOnlyValue}>{formatEuro(proposedValue)}</p>
                </PublicField>
                <div className={styles.tileGrid}>
                  <button
                    type="button"
                    className={`${styles.tile} ${agreed === true ? styles.tileSelected : ''}`}
                    onClick={() => setAgreed(true)}
                  >
                    <div className={styles.tileTitle}>{t('steps.carValue.agreeYes')}</div>
                  </button>
                  <button
                    type="button"
                    className={`${styles.tile} ${agreed === false ? styles.tileSelected : ''}`}
                    onClick={() => setAgreed(false)}
                  >
                    <div className={styles.tileTitle}>{t('steps.carValue.agreeNo')}</div>
                  </button>
                </div>
              </PublicPanel>

              {agreed === false ? (
                <PublicPanel title={t('steps.carValue.counterTitle')}>
                  <PublicField label={tAdmin('columns.carValueCounterProposal')}>
                    <PublicInput type="number" min={0} value={counterValue} onChange={(e) => setCounterValue(e.target.value)} />
                  </PublicField>
                  <PublicField label={tAdmin('columns.carValueCounterProposalMessage')}>
                    <PublicInput value={counterMessage} onChange={(e) => setCounterMessage(e.target.value)} />
                  </PublicField>
                </PublicPanel>
              ) : null}

              {agreed === true ? <div className={styles.bannerSuccess}>{t('steps.carValue.agreeConfirmHint')}</div> : null}
            </>
          ) : null}

          {showPending ? (
            <PublicPanel title={tAdmin('columns.carValue')}>
              <PublicField label={tAdmin('columns.carValue')}>
                <p className={styles.readOnlyValue}>{formatEuro(proposedValue)}</p>
              </PublicField>
              <PublicField label={tAdmin('columns.carValueCounterProposal')}>
                <p className={styles.readOnlyValue}>{formatEuro(carOnboarding.carValueCounterProposal)}</p>
              </PublicField>
              {carOnboarding.carValueCounterProposalMessage ? (
                <PublicField label={tAdmin('columns.carValueCounterProposalMessage')}>
                  <p className={styles.readOnlyValue}>{carOnboarding.carValueCounterProposalMessage}</p>
                </PublicField>
              ) : null}
            </PublicPanel>
          ) : null}

          {showResolved ? (
            <PublicPanel title={tAdmin('columns.carValue')}>
              <PublicField label={tAdmin('columns.carValue')}>
                <p className={styles.readOnlyValue}>{formatEuro(proposedValue)}</p>
              </PublicField>
            </PublicPanel>
          ) : null}
        </>
      ) : null}

      <PublicPanel title={tAdmin('columns.depreciationCostKm')}>
        <PublicField label={tAdmin('columns.depreciationCostKm')}>
          <p className={styles.readOnlyValue}>{formatDepreciation(carOnboarding.depreciationCostKm)}</p>
        </PublicField>
      </PublicPanel>

      <StepActions
        stepId="car-value"
        onSave={handleSave}
        saveDisabled={isSaving || agreed === null || (agreed === false && counterValue === '')}
        showSave={showProposalForm}
      />
    </StepLayout>
  );
}
