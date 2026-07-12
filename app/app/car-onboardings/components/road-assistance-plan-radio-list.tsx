'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';

import styles from '../car-onboarding-public.module.css';

export type RoadAssistancePlanOption = {
  id: string;
  name: string;
  description?: string;
};

type RoadAssistancePlanRadioListProps = {
  value: string;
  onValueChange: (id: string, option: RoadAssistancePlanOption) => void;
};

export function RoadAssistancePlanRadioList({ value, onValueChange }: RoadAssistancePlanRadioListProps) {
  const t = useTranslations('carOnboardingPublic');
  const [plans, setPlans] = useState<RoadAssistancePlanOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      setLoading(true);
      setLoadError(false);

      try {
        const params = new URLSearchParams({ isActive: 'true', take: '100', skip: '0' });
        const response = await fetch(`/api/road-assistance-plans?${params.toString()}`);
        if (!response.ok) {
          if (!cancelled) setLoadError(true);
          return;
        }

        const data = (await response.json()) as { records?: Array<{ id?: string; name?: string; description?: string }> };
        const records = (data.records ?? [])
          .map((record) => ({
            id: String(record.id ?? ''),
            name: record.name ?? '',
            description: record.description?.trim() || undefined,
          }))
          .filter((record) => record.id && record.name);

        if (!cancelled) {
          setPlans(records);
        }
      } catch {
        if (!cancelled) setLoadError(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return <p className={styles.planOptionStatus}>{t('steps.roadAssistancePlan.loading')}</p>;
  }

  if (loadError) {
    return <p className={styles.fieldError}>{t('steps.roadAssistancePlan.loadError')}</p>;
  }

  if (!plans.length) {
    return <p className={styles.planOptionStatus}>{t('steps.roadAssistancePlan.empty')}</p>;
  }

  return (
    <div role="radiogroup" aria-label={t('steps.roadAssistancePlan.desiredPanelTitle')} className={styles.planOptionList}>
      {plans.map((plan) => {
        const selected = value === plan.id;

        return (
          <label key={plan.id} className={`${styles.planOption} ${selected ? styles.planOptionSelected : ''}`}>
            <input
              type="radio"
              name="roadAssistancePlan"
              value={plan.id}
              checked={selected}
              onChange={() => onValueChange(plan.id, plan)}
              className={styles.planOptionRadio}
            />
            <div className={styles.planOptionContent}>
              <span className={styles.planOptionName}>{plan.name}</span>
              {plan.description ? <p className={styles.planOptionDescription}>{plan.description}</p> : null}
            </div>
          </label>
        );
      })}
    </div>
  );
}
