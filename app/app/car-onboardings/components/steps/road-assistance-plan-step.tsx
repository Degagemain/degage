'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';

import { CAR_ONBOARDING_ROAD_ASSISTANCE_PLAN_DESCRIPTION_MAX_LENGTH } from '@/domain/car-onboarding.model';
import { apiPut } from '@/app/lib/api-client';
import { formatDateForInput } from '@/app/components/form/date-input-helpers';
import { parseApiErrorMessage } from '@/app/lib/parse-api-error-message';

import { PublicField, PublicInfoPanel, PublicInput, PublicPanel, PublicSelect } from '../public-ui';
import { StepActions } from '../step-actions';
import { StepLayout } from '../step-layout';
import { useStepReadOnly } from '../step-read-only-context';
import { useCarOnboarding } from '../../lib/car-onboarding-context';

const EXISTING_ROAD_ASSISTANCE_CHOICE_ID = 'existing-road-assistance-choice';

export function RoadAssistancePlanStep() {
  const t = useTranslations('carOnboardingPublic');
  const { carOnboarding, reload } = useCarOnboarding();

  const [hasExistingRoadAssistancePlan, setHasExistingRoadAssistancePlan] = useState<boolean | null>(
    carOnboarding.hasExistingRoadAssistancePlan,
  );
  const [roadAssistancePlanDescription, setRoadAssistancePlanDescription] = useState(carOnboarding.roadAssistancePlanDescription ?? '');
  const [existingEndDate, setExistingEndDate] = useState(formatDateForInput(carOnboarding.existingRoadAssistancePlanEndDate));
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setHasExistingRoadAssistancePlan(carOnboarding.hasExistingRoadAssistancePlan);
    setRoadAssistancePlanDescription(carOnboarding.roadAssistancePlanDescription ?? '');
    setExistingEndDate(formatDateForInput(carOnboarding.existingRoadAssistancePlanEndDate));
  }, [carOnboarding]);

  const canSave =
    hasExistingRoadAssistancePlan === false ||
    (hasExistingRoadAssistancePlan === true && roadAssistancePlanDescription.trim() !== '' && existingEndDate !== '');

  const handleSave = async (): Promise<boolean> => {
    if (!carOnboarding.id || hasExistingRoadAssistancePlan == null) return false;
    const trimmedDescription = roadAssistancePlanDescription.trim();
    if (hasExistingRoadAssistancePlan && (trimmedDescription === '' || existingEndDate === '')) return false;
    setIsSaving(true);
    try {
      const response = await apiPut(`/api/car-onboardings/${carOnboarding.id}/road-assistance-plan`, {
        hasExistingRoadAssistancePlan,
        ...(hasExistingRoadAssistancePlan
          ? {
              roadAssistancePlanDescription: trimmedDescription,
              existingRoadAssistancePlanEndDate: existingEndDate,
            }
          : {}),
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

  return (
    <StepLayout
      stepId="road-assistance-plan"
      beforeFieldset={<PublicInfoPanel title={t('steps.roadAssistancePlan.panelTitle')} body={t('steps.roadAssistancePlan.panelBody')} />}
    >
      <ExistingRoadAssistancePlanPanel
        hasExistingRoadAssistancePlan={hasExistingRoadAssistancePlan}
        onHasExistingChange={setHasExistingRoadAssistancePlan}
        roadAssistancePlanDescription={roadAssistancePlanDescription}
        onRoadAssistancePlanDescriptionChange={setRoadAssistancePlanDescription}
        existingEndDate={existingEndDate}
        onExistingEndDateChange={setExistingEndDate}
      />

      <StepActions stepId="road-assistance-plan" onSave={handleSave} saveDisabled={isSaving || !canSave} />
    </StepLayout>
  );
}

function ExistingRoadAssistancePlanPanel({
  hasExistingRoadAssistancePlan,
  onHasExistingChange,
  roadAssistancePlanDescription,
  onRoadAssistancePlanDescriptionChange,
  existingEndDate,
  onExistingEndDateChange,
}: {
  hasExistingRoadAssistancePlan: boolean | null;
  onHasExistingChange: (value: boolean | null) => void;
  roadAssistancePlanDescription: string;
  onRoadAssistancePlanDescriptionChange: (value: string) => void;
  existingEndDate: string;
  onExistingEndDateChange: (value: string) => void;
}) {
  const t = useTranslations('carOnboardingPublic');
  const tAdmin = useTranslations('admin.carOnboardings');
  const readOnly = useStepReadOnly();
  const choice = hasExistingRoadAssistancePlan === true ? 'yes' : hasExistingRoadAssistancePlan === false ? 'no' : '';

  return (
    <PublicPanel>
      <PublicField
        label={t('steps.roadAssistancePlan.hasExistingFieldLabel')}
        hint={t('steps.roadAssistancePlan.existingPanelBody')}
        htmlFor={EXISTING_ROAD_ASSISTANCE_CHOICE_ID}
      >
        <PublicSelect
          id={EXISTING_ROAD_ASSISTANCE_CHOICE_ID}
          value={choice}
          required
          disabled={readOnly}
          onChange={(e) => {
            const next = e.target.value;
            onHasExistingChange(next === 'yes' ? true : next === 'no' ? false : null);
          }}
        >
          <option value="" disabled>
            {t('steps.roadAssistancePlan.hasExistingPlaceholder')}
          </option>
          <option value="yes">{t('steps.roadAssistancePlan.hasExistingOption')}</option>
          <option value="no">{t('steps.roadAssistancePlan.hasNoExistingOption')}</option>
        </PublicSelect>
      </PublicField>
      {hasExistingRoadAssistancePlan ? (
        <>
          <PublicField
            label={tAdmin('columns.roadAssistancePlanDescription')}
            hint={t('steps.roadAssistancePlan.roadAssistancePlanDescriptionHint')}
          >
            <PublicInput
              type="text"
              value={roadAssistancePlanDescription}
              disabled={readOnly}
              required
              maxLength={CAR_ONBOARDING_ROAD_ASSISTANCE_PLAN_DESCRIPTION_MAX_LENGTH}
              onChange={(e) =>
                onRoadAssistancePlanDescriptionChange(e.target.value.slice(0, CAR_ONBOARDING_ROAD_ASSISTANCE_PLAN_DESCRIPTION_MAX_LENGTH))
              }
            />
          </PublicField>
          <PublicField
            label={tAdmin('columns.existingRoadAssistancePlanEndDate')}
            hint={t('steps.roadAssistancePlan.existingRoadAssistancePlanEndDateHint')}
          >
            <PublicInput
              type="date"
              value={existingEndDate}
              disabled={readOnly}
              required
              onChange={(e) => onExistingEndDateChange(e.target.value)}
            />
          </PublicField>
        </>
      ) : null}
    </PublicPanel>
  );
}
