'use client';

import { useTranslations } from 'next-intl';

import { FaqByTags } from '@/app/components/documentation/faq-by-tags';

import { CAR_ONBOARDING_FAQ_PANEL, carOnboardingFaqTags } from '../car-onboarding-public.constants';
import styles from '../car-onboarding-public.module.css';
import type { StepId } from '../lib/types';

export function CarOnboardingFaq({ stepId }: { stepId?: StepId }) {
  const t = useTranslations('carOnboardingPublic');

  return (
    <FaqByTags
      tags={carOnboardingFaqTags(stepId)}
      heading={t('faqCollapsedTitle')}
      className={styles.faqBlock}
      classNames={CAR_ONBOARDING_FAQ_PANEL}
      showChatFallback={false}
    />
  );
}
