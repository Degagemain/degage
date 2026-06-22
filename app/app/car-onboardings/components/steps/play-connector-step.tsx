'use client';

import { useTranslations } from 'next-intl';

import { PlayConnectorCard } from '@/app/components/account/play-connector-card';

import { StepActions } from '../step-actions';
import { StepLayout } from '../step-layout';
import { useCarOnboarding } from '../../lib/car-onboarding-context';

export function PlayConnectorStep() {
  const t = useTranslations('carOnboardingPublic');
  const { reload } = useCarOnboarding();

  return (
    <StepLayout stepId="play-connector">
      <p className="mb-6 max-w-2xl text-[15px] leading-relaxed text-stone-600 dark:text-stone-400">{t('steps.playConnector.info')}</p>
      <PlayConnectorCard onStatusChange={() => void reload()} />
      <StepActions stepId="play-connector" showSave={false} />
    </StepLayout>
  );
}
