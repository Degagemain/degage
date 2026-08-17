'use client';

import { useTranslations } from 'next-intl';

import { InlineCopy } from '@/app/components/inline-copy';

import { JourneyMeta } from '../components/journey-meta';
import { PublicRoot } from '../components/public-ui';
import { StepSection } from '../components/step-section';
import styles from '../car-onboarding-public.module.css';

export default function CarOnboardingOverviewPage() {
  const t = useTranslations('carOnboardingPublic');

  return (
    <PublicRoot>
      <p className={styles.eyebrow}>{t('journey.eyebrow')}</p>
      <h1 className={styles.pageTitle}>{t('journey.title')}</h1>
      <p className={styles.pageIntro}>
        <InlineCopy>{t('journey.intro')}</InlineCopy>
      </p>
      <JourneyMeta />
      <StepSection />
    </PublicRoot>
  );
}
