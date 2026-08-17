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
  disabled?: boolean;
  showSave?: boolean;
};

export function StepActions({ stepId, onSave, saveDisabled, disabled = false, showSave = true }: StepActionsProps) {
  const t = useTranslations('carOnboardingPublic');
  const readOnly = useStepReadOnly();
  const router = useRouter();
  const { carOnboarding, basePath } = useCarOnboarding();
  const next = getNextAccessibleStep(carOnboarding, stepId);
  const continueHref = next ? `${basePath}/${next.id}` : basePath;
  const canSave = showSave && Boolean(onSave) && !readOnly;
  const [isNavigatingNext, setIsNavigatingNext] = useState(false);
  const actionsDisabled = disabled || Boolean(saveDisabled);

  if (!canSave && !next) return null;

  return (
    <div className={styles.subflowActions}>
      {canSave && onSave ? (
        <PublicBtn
          onClick={() => {
            void onSave();
          }}
          disabled={actionsDisabled}
        >
          {t('save')}
        </PublicBtn>
      ) : null}
      {canSave && onSave ? (
        <PublicBtn
          disabled={actionsDisabled || isNavigatingNext}
          onClick={() => {
            void (async () => {
              setIsNavigatingNext(true);
              try {
                const ok = await onSave();
                if (!ok) return;
                router.push(continueHref);
              } finally {
                setIsNavigatingNext(false);
              }
            })();
          }}
        >
          {t('saveAndNext')} →
        </PublicBtn>
      ) : next ? (
        disabled ? (
          <PublicBtn variant="secondary" disabled>
            {t('next')} →
          </PublicBtn>
        ) : (
          <Link href={continueHref} className={`${styles.btn} ${styles.btnSecondary}`}>
            {t('next')} →
          </Link>
        )
      ) : null}
    </div>
  );
}
