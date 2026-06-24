'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';

import { computeStepState } from '../lib/compute-step-state';
import { useCarOnboarding } from '../lib/car-onboarding-context';
import type { StepDefinition } from '../lib/steps-config';
import { StateIcon } from './public-ui';
import styles from '../car-onboarding-public.module.css';

type StepCardProps = {
  definition: StepDefinition;
  stepNumber: number;
  isLast: boolean;
};

export function StepCard({ definition, stepNumber, isLast }: StepCardProps) {
  const t = useTranslations('carOnboardingPublic');
  const { carOnboarding, basePath } = useCarOnboarding();
  const stepState = computeStepState(definition.id, carOnboarding);
  const disabled = stepState === 'blocked';
  const href = `${basePath}/${definition.id}`;
  const showStatus = !disabled;

  const content = (
    <div className={styles.subflowCardInner}>
      <div className={styles.subflowCardTrack}>
        <span className={styles.subflowCardStep}>{stepNumber}</span>
        {!isLast ? <span className={styles.subflowCardConnector} aria-hidden /> : null}
      </div>
      <div className={styles.subflowCardBody}>
        <h3 className={styles.subflowCardTitle}>
          {t(definition.titleKey)}
          {showStatus ? <StateIcon state={stepState} /> : null}
        </h3>
        <p className={styles.subflowCardSubtitle}>{t(definition.subtitleKey)}</p>
      </div>
    </div>
  );

  if (disabled) {
    return <div className={`${styles.subflowCard} ${styles.subflowCardDisabled}`}>{content}</div>;
  }

  return (
    <Link href={href} className={styles.subflowCard}>
      {content}
    </Link>
  );
}
