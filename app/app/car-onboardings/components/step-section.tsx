'use client';

import { useTranslations } from 'next-intl';

import { getOrderedSteps } from '../lib/step-navigation';
import { useCarOnboarding } from '../lib/car-onboarding-context';
import { StepCard } from './step-card';
import styles from '../car-onboarding-public.module.css';

export function StepSection() {
  const t = useTranslations('carOnboardingPublic');
  const { carOnboarding } = useCarOnboarding();
  const steps = getOrderedSteps(carOnboarding);

  return (
    <section className={styles.stageSection}>
      <div className={styles.stageHeader}>
        <h2 className={styles.sectionTitle}>{t('preparationTitle')}</h2>
      </div>
      <div className={styles.stageCards}>
        {steps.map((step, index) => (
          <StepCard key={step.id} definition={step} stepNumber={index + 1} isLast={index === steps.length - 1} />
        ))}
      </div>
    </section>
  );
}
