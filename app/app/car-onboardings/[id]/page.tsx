'use client';

import { useTranslations } from 'next-intl';

import { PublicRoot } from '../components/public-ui';
import { StepSection } from '../components/step-section';
import styles from '../car-onboarding-public.module.css';

export default function CarOnboardingOverviewPage() {
  const t = useTranslations('carOnboardingPublic');

  return (
    <PublicRoot>
      <p className={styles.eyebrow}>{t('eyebrow')}</p>
      <h1 className={styles.pageTitle}>{t('title')}</h1>
      <p className={styles.pageIntro}>{t('intro')}</p>
      <StepSection />
    </PublicRoot>
  );
}
