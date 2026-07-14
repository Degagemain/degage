'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';

import { apiPut } from '@/app/lib/api-client';
import { parseApiErrorMessage } from '@/app/lib/parse-api-error-message';

import { PublicField, PublicInput, PublicPanel } from '../public-ui';
import { RoadAssistancePlanRadioList } from '../road-assistance-plan-radio-list';
import { StepActions } from '../step-actions';
import { StepLayout } from '../step-layout';
import { useStepReadOnly } from '../step-read-only-context';
import { useCarOnboarding } from '../../lib/car-onboarding-context';
import styles from '../../car-onboarding-public.module.css';

const formatDateInput = (date: Date | string | null): string => {
  if (date == null) return '';
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return '';
  return parsed.toISOString().slice(0, 10);
};

export function RoadAssistancePlanStep() {
  const t = useTranslations('carOnboardingPublic');
  const { carOnboarding, reload } = useCarOnboarding();

  const [hasExistingRoadAssistancePlan, setHasExistingRoadAssistancePlan] = useState(carOnboarding.hasExistingRoadAssistancePlan);
  const [existingEndDate, setExistingEndDate] = useState(formatDateInput(carOnboarding.existingRoadAssistancePlanEndDate));
  const [roadAssistancePlanId, setRoadAssistancePlanId] = useState(carOnboarding.roadAssistancePlan?.id ?? '');
  const [roadAssistancePlanName, setRoadAssistancePlanName] = useState(carOnboarding.roadAssistancePlan?.name ?? '');
  const [isSaving, setIsSaving] = useState(false);

  const isPurchasedNew = carOnboarding.isPurchased && carOnboarding.isNewCar;

  useEffect(() => {
    setHasExistingRoadAssistancePlan(carOnboarding.hasExistingRoadAssistancePlan);
    setExistingEndDate(formatDateInput(carOnboarding.existingRoadAssistancePlanEndDate));
    setRoadAssistancePlanId(carOnboarding.roadAssistancePlan?.id ?? '');
    setRoadAssistancePlanName(carOnboarding.roadAssistancePlan?.name ?? '');
  }, [carOnboarding]);

  const handleSave = async (): Promise<boolean> => {
    if (!carOnboarding.id) return false;
    setIsSaving(true);
    try {
      const response = await apiPut(`/api/car-onboardings/${carOnboarding.id}/road-assistance-plan`, {
        hasExistingRoadAssistancePlan,
        ...(hasExistingRoadAssistancePlan && existingEndDate ? { existingRoadAssistancePlanEndDate: existingEndDate } : {}),
        ...(roadAssistancePlanId ? { roadAssistancePlan: { id: roadAssistancePlanId, name: roadAssistancePlanName } } : {}),
      });
      if (!response.ok) {
        toast.error(await parseApiErrorMessage(response, t('errors.save')));
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

  const existingPlanField = (
    <ExistingRoadAssistancePlanPanel
      isPurchasedNew={isPurchasedNew}
      hasExistingRoadAssistancePlan={hasExistingRoadAssistancePlan}
      onHasExistingChange={setHasExistingRoadAssistancePlan}
      existingEndDate={existingEndDate}
      onExistingEndDateChange={setExistingEndDate}
    />
  );

  return (
    <StepLayout stepId="road-assistance-plan" beforeFieldset={existingPlanField}>
      <PublicPanel title={t('steps.roadAssistancePlan.desiredPanelTitle')} body={t('steps.roadAssistancePlan.desiredPanelBody')}>
        <RoadAssistancePlanRadioList
          value={roadAssistancePlanId}
          onValueChange={(id, option) => {
            setRoadAssistancePlanId(id);
            setRoadAssistancePlanName(option.name);
          }}
        />
      </PublicPanel>

      <StepActions stepId="road-assistance-plan" onSave={handleSave} saveDisabled={isSaving} />
    </StepLayout>
  );
}

function ExistingRoadAssistancePlanPanel({
  isPurchasedNew,
  hasExistingRoadAssistancePlan,
  onHasExistingChange,
  existingEndDate,
  onExistingEndDateChange,
}: {
  isPurchasedNew: boolean;
  hasExistingRoadAssistancePlan: boolean;
  onHasExistingChange: (value: boolean) => void;
  existingEndDate: string;
  onExistingEndDateChange: (value: string) => void;
}) {
  const t = useTranslations('carOnboardingPublic');
  const tAdmin = useTranslations('admin.carOnboardings');
  const readOnly = useStepReadOnly();

  return (
    <PublicPanel>
      {isPurchasedNew ? (
        <PublicField label={t('steps.roadAssistancePlan.includedPlanLabel')} hint={t('steps.roadAssistancePlan.existingPanelBody')}>
          <label className={styles.checkboxLabel}>
            <PublicInput
              type="checkbox"
              checked={hasExistingRoadAssistancePlan}
              disabled={readOnly}
              onChange={(e) => onHasExistingChange(e.target.checked)}
            />
            <span>{t('steps.roadAssistancePlan.includedPlanCheckbox')}</span>
          </label>
        </PublicField>
      ) : (
        <PublicField label={t('steps.roadAssistancePlan.hasExistingFieldLabel')} hint={t('steps.roadAssistancePlan.existingPanelBody')}>
          <label className={styles.checkboxLabel}>
            <PublicInput
              type="checkbox"
              checked={hasExistingRoadAssistancePlan}
              disabled={readOnly}
              onChange={(e) => onHasExistingChange(e.target.checked)}
            />
            <span>{t('steps.roadAssistancePlan.hasExistingLabel')}</span>
          </label>
        </PublicField>
      )}
      {hasExistingRoadAssistancePlan ? (
        <PublicField
          label={tAdmin('columns.existingRoadAssistancePlanEndDate')}
          hint={t('steps.roadAssistancePlan.existingRoadAssistancePlanEndDateHint')}
        >
          <PublicInput type="date" value={existingEndDate} disabled={readOnly} onChange={(e) => onExistingEndDateChange(e.target.value)} />
        </PublicField>
      ) : null}
    </PublicPanel>
  );
}
