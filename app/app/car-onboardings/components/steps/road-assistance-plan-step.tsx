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

const formatDateInput = (date: Date | string | null): string => {
  if (date == null) return '';
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return '';
  return parsed.toISOString().slice(0, 10);
};

export function RoadAssistancePlanStep() {
  const t = useTranslations('carOnboardingPublic');
  const tAdmin = useTranslations('admin.carOnboardings');
  const { carOnboarding, reload } = useCarOnboarding();

  const [hasExistingRoadAssistancePlan, setHasExistingRoadAssistancePlan] = useState(carOnboarding.hasExistingRoadAssistancePlan);
  const [existingEndDate, setExistingEndDate] = useState(formatDateInput(carOnboarding.existingRoadAssistancePlanEndDate));
  const [roadAssistancePlanId, setRoadAssistancePlanId] = useState(carOnboarding.roadAssistancePlan?.id ?? '');
  const [roadAssistancePlanName, setRoadAssistancePlanName] = useState(carOnboarding.roadAssistancePlan?.name ?? '');
  const [roadAssistancePlanDescription, setRoadAssistancePlanDescription] = useState<string | undefined>(undefined);
  const [isSaving, setIsSaving] = useState(false);

  const isPurchasedNew = carOnboarding.isPurchased && carOnboarding.isNewCar;

  useEffect(() => {
    setHasExistingRoadAssistancePlan(carOnboarding.hasExistingRoadAssistancePlan);
    setExistingEndDate(formatDateInput(carOnboarding.existingRoadAssistancePlanEndDate));
    setRoadAssistancePlanId(carOnboarding.roadAssistancePlan?.id ?? '');
    setRoadAssistancePlanName(carOnboarding.roadAssistancePlan?.name ?? '');
  }, [carOnboarding]);

  useEffect(() => {
    if (!roadAssistancePlanId) {
      setRoadAssistancePlanDescription(undefined);
      return;
    }

    let cancelled = false;
    void (async () => {
      const response = await fetch(`/api/road-assistance-plans/${roadAssistancePlanId}`);
      if (!response.ok || cancelled) return;
      const plan = (await response.json()) as { description?: string };
      if (!cancelled) {
        setRoadAssistancePlanDescription(plan.description?.trim() || undefined);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [roadAssistancePlanId]);

  const handleSave = async () => {
    if (!carOnboarding.id) return;
    setIsSaving(true);
    try {
      const response = await apiPut(`/api/car-onboardings/${carOnboarding.id}/road-assistance-plan`, {
        hasExistingRoadAssistancePlan,
        ...(hasExistingRoadAssistancePlan && existingEndDate ? { existingRoadAssistancePlanEndDate: existingEndDate } : {}),
        ...(roadAssistancePlanId ? { roadAssistancePlan: { id: roadAssistancePlanId, name: roadAssistancePlanName } } : {}),
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
    <StepLayout stepId="road-assistance-plan">
      <PublicPanel title={t('steps.roadAssistancePlan.existingPanelTitle')}>
        {isPurchasedNew ? (
          <PublicField label={t('steps.roadAssistancePlan.includedPlanLabel')}>
            <label className={styles.checkboxLabel}>
              <PublicInput
                type="checkbox"
                checked={hasExistingRoadAssistancePlan}
                onChange={(e) => setHasExistingRoadAssistancePlan(e.target.checked)}
              />
              <span>{t('steps.roadAssistancePlan.includedPlanCheckbox')}</span>
            </label>
          </PublicField>
        ) : (
          <PublicField label={tAdmin('columns.hasExistingRoadAssistancePlan')}>
            <label className={styles.checkboxLabel}>
              <PublicInput
                type="checkbox"
                checked={hasExistingRoadAssistancePlan}
                onChange={(e) => setHasExistingRoadAssistancePlan(e.target.checked)}
              />
              <span>{t('steps.roadAssistancePlan.hasExistingLabel')}</span>
            </label>
          </PublicField>
        )}
        {hasExistingRoadAssistancePlan ? (
          <PublicField label={tAdmin('columns.existingRoadAssistancePlanEndDate')}>
            <PublicInput type="date" value={existingEndDate} onChange={(e) => setExistingEndDate(e.target.value)} />
          </PublicField>
        ) : null}
      </PublicPanel>

      <PublicPanel title={t('steps.roadAssistancePlan.desiredPanelTitle')}>
        <PublicSearchableField
          label={tAdmin('columns.roadAssistancePlan')}
          value={roadAssistancePlanId}
          selectedLabel={roadAssistancePlanName || undefined}
          selectedDescription={roadAssistancePlanDescription}
          onValueChange={(id, option) => {
            setRoadAssistancePlanId(id);
            setRoadAssistancePlanName(option.name);
            setRoadAssistancePlanDescription(option.description);
          }}
          apiPath="road-assistance-plans"
          queryParams={{ isActive: 'true' }}
          descriptionKey="description"
          placeholder={tAdmin('form.placeholders.roadAssistancePlan')}
        />
      </PublicPanel>

      <StepActions stepId="road-assistance-plan" onSave={() => void handleSave()} saveDisabled={isSaving} />
    </StepLayout>
  );
}
