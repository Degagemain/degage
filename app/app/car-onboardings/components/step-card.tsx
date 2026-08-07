'use client';

import Link from 'next/link';
import { Lock } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { cn } from '@/app/lib/utils';

import type { ChapterActor } from '../lib/chapters-config';
import type { StepState } from '../lib/types';
import styles from '../car-onboarding-public.module.css';

type OverviewStepCardProps = {
  stepNumber: number;
  title: string;
  subtitle: string;
  state: StepState;
  href?: string;
  actors?: ChapterActor[];
};

function StepStatusMark({ state }: { state: StepState }) {
  const t = useTranslations('carOnboardingPublic.states');

  if (state === 'blocked') {
    return (
      <span className={styles.stepMarkLocked} title={t('blocked')} aria-label={t('blocked')}>
        <Lock aria-hidden />
      </span>
    );
  }

  if (state === 'done') {
    return (
      <span className={cn(styles.stepMark, styles.stepMarkDone)} title={t('done')} aria-label={t('done')}>
        ✓
      </span>
    );
  }

  if (state === 'pending') {
    return (
      <span className={cn(styles.stepMark, styles.stepMarkPending)} title={t('pending')} aria-label={t('pending')}>
        …
      </span>
    );
  }

  return <span className={cn(styles.stepMark, styles.stepMarkTodo)} title={t('todo')} aria-label={t('todo')} />;
}

export function OverviewStepCard({ stepNumber, title, subtitle, state, href, actors = [] }: OverviewStepCardProps) {
  const t = useTranslations('carOnboardingPublic');
  const disabled = state === 'blocked' || !href;

  const content = (
    <>
      <div className={styles.subflowCardNumWrap}>
        <span className={styles.subflowCardStep}>{stepNumber}</span>
      </div>
      <div className={styles.subflowCardBody}>
        <h3 className={styles.subflowCardTitle}>{title}</h3>
        <p className={styles.subflowCardSubtitle}>{subtitle}</p>
      </div>
      <div className={styles.subflowCardMeta}>
        {actors.map((actor) => (
          <span key={actor} className={cn(styles.actorTag, actor === 'you' ? styles.actorTagYou : styles.actorTagDegage)}>
            {t(`actors.${actor}`)}
          </span>
        ))}
        <StepStatusMark state={disabled ? 'blocked' : state} />
      </div>
    </>
  );

  const className = cn(styles.subflowCard, disabled && styles.subflowCardDisabled);

  if (disabled) {
    return <div className={className}>{content}</div>;
  }

  return (
    <Link href={href} className={className}>
      {content}
    </Link>
  );
}
