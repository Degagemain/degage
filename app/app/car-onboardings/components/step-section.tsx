'use client';

import { useTranslations } from 'next-intl';

import { InlineCopy } from '@/app/components/inline-copy';
import { CarOnboardingInPreparationStatus } from '@/domain/car-onboarding.model';
import { cn } from '@/app/lib/utils';

import { CHAPTER_DEFINITIONS, type ChapterDefinition } from '../lib/chapters-config';
import { computeStepState } from '../lib/compute-step-state';
import { getOrderedSteps } from '../lib/step-navigation';
import { useCarOnboarding } from '../lib/car-onboarding-context';
import { OverviewStepCard } from './step-card';
import { PreparationConfirmCard } from './preparation-confirm-card';
import styles from '../car-onboarding-public.module.css';

type ChapterDisplayStatus = 'open' | 'ready' | 'locked';

function chapterStatusClass(status: ChapterDisplayStatus) {
  if (status === 'ready') return styles.chapterStatusReady;
  if (status === 'locked') return styles.chapterStatusLocked;
  return styles.chapterStatusOpen;
}

/** Preparation locked = sealed/done, not "still locked" like later chapters. */
function preparationDisplayStatus(status: CarOnboardingInPreparationStatus): ChapterDisplayStatus {
  return status === CarOnboardingInPreparationStatus.OPEN ? 'open' : 'ready';
}

function PreparationChapter({ chapter }: { chapter: ChapterDefinition }) {
  const t = useTranslations('carOnboardingPublic');
  const { carOnboarding, basePath } = useCarOnboarding();
  const steps = getOrderedSteps(carOnboarding);
  const doneCount = steps.filter((step) => computeStepState(step.id, carOnboarding) === 'done').length;
  const status = preparationDisplayStatus(carOnboarding.statusInPreparation);

  return (
    <ChapterShell chapter={chapter} status={status} progressLabel={t('chapterProgress', { done: doneCount, total: steps.length })}>
      <div className={styles.stageCards}>
        {steps.map((step, index) => {
          const stepState = computeStepState(step.id, carOnboarding);
          const href = stepState === 'blocked' ? undefined : `${basePath}/${step.id}`;
          return (
            <OverviewStepCard
              key={step.id}
              stepNumber={index + 1}
              title={t(step.titleKey)}
              subtitle={t(step.subtitleKey)}
              state={stepState}
              href={href}
              actors={step.actors}
            />
          );
        })}
        <PreparationConfirmCard />
      </div>
    </ChapterShell>
  );
}

function LockedDummyChapter({ chapter }: { chapter: ChapterDefinition }) {
  const t = useTranslations('carOnboardingPublic');
  const steps = chapter.dummySteps ?? [];

  return (
    <ChapterShell chapter={chapter} status="locked" progressLabel={t('chapterProgress', { done: 0, total: steps.length })}>
      <div className={styles.stageCards}>
        {steps.map((step, index) => (
          <OverviewStepCard
            key={step.id}
            stepNumber={index + 1}
            title={t(step.titleKey)}
            subtitle={t(step.subtitleKey)}
            state="blocked"
            actors={step.actors}
          />
        ))}
      </div>
    </ChapterShell>
  );
}

function ChapterShell({
  chapter,
  status,
  progressLabel,
  children,
}: {
  chapter: ChapterDefinition;
  status: 'open' | 'ready' | 'locked';
  progressLabel: string;
  children: React.ReactNode;
}) {
  const t = useTranslations('carOnboardingPublic');

  return (
    <section
      className={cn(
        styles.chapterBlock,
        chapter.accent === 'green' && styles.chapterBlockGreen,
        chapter.accent === 'amber' && styles.chapterBlockAmber,
        chapter.accent === 'purple' && styles.chapterBlockPurple,
      )}
    >
      <div className={styles.chapterSpine} aria-hidden>
        <span className={styles.chapterDot} />
        <span className={styles.chapterLine} />
      </div>
      <div className={styles.chapterContent}>
        <div className={styles.stageHeader}>
          <div className={styles.chapterHeading}>
            <p className={styles.chapterLabel}>{t('chapterLabel', { num: chapter.num })}</p>
            <h2 className={styles.sectionTitle}>{t(chapter.titleKey)}</h2>
            <p className={styles.chapterTagline}>
              <InlineCopy>{t(chapter.taglineKey)}</InlineCopy>
            </p>
          </div>
          <span className={cn(styles.chapterStatus, chapterStatusClass(status))}>
            {progressLabel}
            {' · '}
            {t(`chapterStatus.${status}`)}
          </span>
        </div>
        {children}
      </div>
    </section>
  );
}

export function StepSection() {
  return (
    <div className={styles.journeyChapters}>
      {CHAPTER_DEFINITIONS.map((chapter) =>
        chapter.id === 'preparation' ? (
          <PreparationChapter key={chapter.id} chapter={chapter} />
        ) : (
          <LockedDummyChapter key={chapter.id} chapter={chapter} />
        ),
      )}
    </div>
  );
}
