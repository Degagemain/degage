'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

import { getNextAccessibleStep } from '../lib/step-navigation';
import { useCarOnboarding } from '../lib/car-onboarding-context';
import { useStepReadOnly } from './step-read-only-context';
import type { StepId } from '../lib/types';
import { PublicBtn } from './public-ui';
import styles from '../car-onboarding-public.module.css';

type StepActionsProps = {
  stepId: StepId;
  onSave?: () => Promise<boolean>;
  saveDisabled?: boolean;
  showSave?: boolean;
};

export function StepActions({ stepId, onSave, saveDisabled, showSave = true }: StepActionsProps) {
  const t = useTranslations('carOnboardingPublic');
  const readOnly = useStepReadOnly();
  const router = useRouter();
  const { carOnboarding, basePath } = useCarOnboarding();
  const next = getNextAccessibleStep(carOnboarding, stepId);
  const nextHref = next ? `${basePath}/${next.id}` : null;
  const canSave = showSave && Boolean(onSave) && !readOnly;
  const [isNavigatingNext, setIsNavigatingNext] = useState(false);

  if (!canSave && !nextHref) return null;

  return (
    <div className={styles.subflowActions}>
      {canSave && onSave ? (
        <PublicBtn
          onClick={() => {
            void onSave();
          }}
          disabled={saveDisabled}
        >
          {t('save')}
        </PublicBtn>
      ) : null}
      {nextHref ? (
        canSave && onSave ? (
          <PublicBtn
            disabled={saveDisabled || isNavigatingNext}
            onClick={() => {
              void (async () => {
                setIsNavigatingNext(true);
                try {
                  const ok = await onSave();
                  if (!ok) return;
                  router.push(nextHref);
                } finally {
                  setIsNavigatingNext(false);
                }
              })();
            }}
          >
            {t('next')} →
          </PublicBtn>
        ) : (
          <Link href={nextHref} className={`${styles.btn} ${styles.btnSecondary}`}>
            {t('next')} →
          </Link>
        )
      ) : null}
    </div>
  );
}
