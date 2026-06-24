'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';

import { getNextAccessibleStep } from '../lib/step-navigation';
import { useCarOnboarding } from '../lib/car-onboarding-context';
import { useStepReadOnly } from './step-read-only-context';
import type { StepId } from '../lib/types';
import { PublicBtn } from './public-ui';
import styles from '../car-onboarding-public.module.css';

type StepActionsProps = {
  stepId: StepId;
  onSave?: () => void;
  saveDisabled?: boolean;
  showSave?: boolean;
};

export function StepActions({ stepId, onSave, saveDisabled, showSave = true }: StepActionsProps) {
  const t = useTranslations('carOnboardingPublic');
  const readOnly = useStepReadOnly();
  const { carOnboarding, basePath } = useCarOnboarding();
  const next = getNextAccessibleStep(carOnboarding, stepId);
  const nextHref = next ? `${basePath}/${next.id}` : null;
  const canSave = showSave && Boolean(onSave) && !readOnly;

  if (!canSave && !nextHref) return null;

  return (
    <div className={styles.subflowActions}>
      {canSave && onSave ? (
        <PublicBtn onClick={onSave} disabled={saveDisabled}>
          {t('save')}
        </PublicBtn>
      ) : null}
      {nextHref ? (
        <Link href={nextHref} className={`${styles.btn} ${styles.btnSecondary}`}>
          {t('next')} →
        </Link>
      ) : null}
    </div>
  );
}
