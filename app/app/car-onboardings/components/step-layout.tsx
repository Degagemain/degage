'use client';

import { useTranslations } from 'next-intl';

import { computeStepState, isStepReadOnly } from '../lib/compute-step-state';
import { getStepDefinition } from '../lib/steps-config';
import { useCarOnboarding } from '../lib/car-onboarding-context';
import type { StepId } from '../lib/types';
import { PublicBackLink, PublicRoot, StateIcon } from './public-ui';
import { StepReadOnlyProvider } from './step-read-only-context';
import styles from '../car-onboarding-public.module.css';

export function StepLayout({ stepId, children }: { stepId: StepId; children: React.ReactNode }) {
  const t = useTranslations('carOnboardingPublic');
  const { carOnboarding, basePath } = useCarOnboarding();
  const definition = getStepDefinition(stepId);
  const stepState = computeStepState(stepId, carOnboarding);
  const readOnly = isStepReadOnly(stepId, carOnboarding);

  if (!definition) {
    return (
      <PublicRoot>
        <p>{t('stepNotFound')}</p>
      </PublicRoot>
    );
  }

  if (stepState === 'blocked') {
    return (
      <PublicRoot>
        <PublicBackLink href={basePath}>{t('backToOverview')}</PublicBackLink>
        <h1 className={styles.pageTitle}>{t(definition.titleKey)}</h1>
        <p className={styles.pageIntro}>{t('stepBlocked')}</p>
      </PublicRoot>
    );
  }

  return (
    <PublicRoot>
      <StepReadOnlyProvider readOnly={readOnly}>
        <PublicBackLink href={basePath}>{t('backToOverview')}</PublicBackLink>
        <div className={styles.subflowTitleRow}>
          <h1 className={styles.pageTitle}>{t(definition.titleKey)}</h1>
          <StateIcon state={stepState} inline />
        </div>
        <fieldset disabled={readOnly} className={styles.subflowFieldset}>
          {children}
        </fieldset>
      </StepReadOnlyProvider>
    </PublicRoot>
  );
}
