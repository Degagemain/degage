'use client';

import { useTranslations } from 'next-intl';

import { PlayConnectorCard } from '@/app/components/account/play-connector-card';

import { PublicInfoPanel } from '../public-ui';
import { StepActions } from '../step-actions';
import { StepLayout } from '../step-layout';
import { useCarOnboarding } from '../../lib/car-onboarding-context';

export function PlayConnectorStep() {
  const t = useTranslations('carOnboardingPublic');
  const { carOnboarding, reload } = useCarOnboarding();

  return (
    <StepLayout stepId="play-connector">
      <PublicInfoPanel title={t('steps.playConnector.panelTitle')} body={t('steps.playConnector.panelBody')} />
      <PlayConnectorCard
        connectPath={carOnboarding.id ? `/api/car-onboardings/${carOnboarding.id}/play-connector` : undefined}
        onStatusChange={() => void reload()}
        allowDisconnect={false}
      />
      <StepActions stepId="play-connector" showSave={false} />
    </StepLayout>
  );
}
